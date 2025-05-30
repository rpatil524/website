/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* Component to record feedback for a rag answer */

import React, { useContext, useEffect, useState } from "react";

import { loadSpinner, removeSpinner } from "../../shared/util";
import { ClaimCounter } from "./claim_counter";
import { FEEDBACK_PANE_ID, RAG_CLAIM_KEYS } from "./constants";
import { AppContext, SessionContext } from "./context";
import { getAllFields, getPath, saveToSheet, setFields } from "./data_store";
import { FeedbackWrapper } from "./feedback_wrapper";

const EMPTY_COUNTS = {
  [RAG_CLAIM_KEYS.QUERY_TOTAL_STAT_CLAIMS_KEY]: 0,
  [RAG_CLAIM_KEYS.QUERY_FALSE_STAT_CLAIMS_KEY]: 0,
  [RAG_CLAIM_KEYS.QUERY_TOTAL_INF_CLAIMS_KEY]: 0,
  [RAG_CLAIM_KEYS.QUERY_FALSE_INF_CLAIMS_KEY]: 0,
  [RAG_CLAIM_KEYS.QUERY_UNSUB_INF_CLAIMS_KEY]: 0,
  [RAG_CLAIM_KEYS.QUERY_TABLES_USED_KEY]: 0,
};
const COUNTER_LABELS = {
  [RAG_CLAIM_KEYS.QUERY_TOTAL_STAT_CLAIMS_KEY]: "Total claims",
  [RAG_CLAIM_KEYS.QUERY_FALSE_STAT_CLAIMS_KEY]: "False claims",
  [RAG_CLAIM_KEYS.QUERY_TOTAL_INF_CLAIMS_KEY]: "Total claims",
  [RAG_CLAIM_KEYS.QUERY_FALSE_INF_CLAIMS_KEY]: "False claims",
  [RAG_CLAIM_KEYS.QUERY_UNSUB_INF_CLAIMS_KEY]: "Unsubstantiated claims",
  [RAG_CLAIM_KEYS.QUERY_TABLES_USED_KEY]: "Unique tables used",
};

interface RagAnsResponse {
  // where key is the firestore key used to store the count for that thing and
  // value is the count
  counts: Record<string, number>;
  isSubmitted: boolean;
}

export function RagAnsFeedback(): JSX.Element {
  const { doc, sheetId, userEmail } = useContext(AppContext);
  const { sessionQueryId, sessionCallId } = useContext(SessionContext);
  const [response, setResponse] = useState<RagAnsResponse>(null);

  useEffect(() => {
    loadSpinner(FEEDBACK_PANE_ID);
    getAllFields(getPath(sheetId, sessionQueryId))
      .then((data) => {
        let complete = true;
        const counts = EMPTY_COUNTS;
        for (const countKey of Object.keys(counts)) {
          if (!(countKey in data)) {
            complete = false;
            continue;
          }
          counts[countKey] = Number(data[countKey]);
        }
        setResponse({
          counts,
          isSubmitted: complete,
        });
      })
      .finally(() => {
        removeSpinner(FEEDBACK_PANE_ID);
      });
  }, [sheetId, sessionQueryId, sessionCallId]);

  const checkAndSubmit = async (): Promise<boolean> => {
    if (response === null) {
      return Promise.resolve(false);
    }
    if (response.isSubmitted) {
      return Promise.resolve(true);
    }
    const countsAsStrings = {};
    Object.keys(response.counts).forEach((countKey) => {
      countsAsStrings[countKey] = String(response.counts[countKey]);
    });
    loadSpinner(FEEDBACK_PANE_ID);
    return Promise.all([
      setFields(getPath(sheetId, sessionQueryId), countsAsStrings),
      saveToSheet(
        userEmail,
        doc,
        sessionQueryId,
        sessionCallId,
        response.counts
      ),
    ])
      .then(() => {
        return true;
      })
      .catch((error) => {
        alert("Error submitting response: " + error);
        return false;
      })
      .finally(() => {
        removeSpinner(FEEDBACK_PANE_ID);
      });
  };

  const enableReeval = (): void => {
    setResponse({
      counts: EMPTY_COUNTS,
      isSubmitted: false,
    });
  };

  const onCountUpdated = (count: number, countKey: string): void => {
    if (response.isSubmitted) {
      return;
    }
    setResponse((prevState) => {
      return {
        ...prevState,
        counts: { ...prevState.counts, [countKey]: count },
      };
    });
  };

  if (response === null) {
    return null;
  }

  return (
    <FeedbackWrapper onReEval={enableReeval} checkAndSubmit={checkAndSubmit}>
      <div className="block-evaluation question-section">
        <div className="title">STATISTICAL CLAIMS EVALUATION</div>
        <div className="subtitle">
          Statistical claims total count (e.g., a number retrieved from a table)
        </div>
        <div className="counter-group">
          {[
            RAG_CLAIM_KEYS.QUERY_TOTAL_STAT_CLAIMS_KEY,
            RAG_CLAIM_KEYS.QUERY_FALSE_STAT_CLAIMS_KEY,
            RAG_CLAIM_KEYS.QUERY_TABLES_USED_KEY,
          ].map((cntKey) => {
            return (
              <div
                className={`counter${response.isSubmitted ? " disabled" : ""}`}
                key={cntKey}
              >
                <ClaimCounter
                  count={response.counts[cntKey]}
                  onCountUpdated={(count): void =>
                    onCountUpdated(count, cntKey)
                  }
                  label={COUNTER_LABELS[cntKey]}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="block-evaluation question-section">
        <div className="title">INFERRED CLAIMS EVALUATION</div>
        <div className="subtitle">
          Inferred claims total count (e.g., X is better than Y)
        </div>
        <div className="counter-group">
          {[
            RAG_CLAIM_KEYS.QUERY_TOTAL_INF_CLAIMS_KEY,
            RAG_CLAIM_KEYS.QUERY_FALSE_INF_CLAIMS_KEY,
            RAG_CLAIM_KEYS.QUERY_UNSUB_INF_CLAIMS_KEY,
          ].map((cntKey) => {
            return (
              <div
                className={`counter${response.isSubmitted ? " disabled" : ""}`}
                key={cntKey}
              >
                <ClaimCounter
                  count={response.counts[cntKey]}
                  onCountUpdated={(count): void =>
                    onCountUpdated(count, cntKey)
                  }
                  label={COUNTER_LABELS[cntKey]}
                />
              </div>
            );
          })}
        </div>
      </div>
    </FeedbackWrapper>
  );
}
