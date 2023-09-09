/**
 * Copyright 2023 Google LLC
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
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import backgroundImg from "../../../public/images/datacommons/place-background.png";
import { CountrySelect } from "../shared/components";

const Container = styled.div`
  font-family: Roboto;

  img {
    width: 100%;
  }
`;

const PlaceContent = styled.div`
  background-image: url(${backgroundImg});
  background-repeat: no-repeat;
  background-size: cover;
  height: 685px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PlaceSearchContainer = styled.div`
  border-radius: 10px;
  border: 1px solid #414042;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 4px 4px 8px 0px rgba(0, 0, 0, 0.15);
  max-width: 702px;
  width: 90%;
  padding: 40px 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  justify-content: center;

  .title {
    color: #449bd5;
    font-size: 34px;
    font-weight: 700;
    line-height: 47px;
    padding: 0 73px;
    width: 100%;
  }

  .footer {
    color: #414042;
    font-size: 22px;
    font-weight: 400;
    line-height: 36px;
    width: 100%;
    padding: 0 73px;
  }

  .search-bar-container {
    width: 100%;
    padding: 0 33px;

    svg {
      display: none;
    }

    .ant-select {
      .ant-select-selector {
        height: 100%;
        display: flex;
        align-items: center;
        font-size: 24px;
        border-radius: 30px;
  
        .ant-select-selection-search {
          height: 100%;
          display: flex;
          align-items: center;
  
          input {
            height: fit-content;
            padding-left: 30px;
          }
        }
  
        .ant-select-selection-placeholder {
          height: fit-content;
          font-style: italic;
          padding-left: 30px;
        }
      }
    }
  }
`;

export const PlaceSection = () => {
  const history = useHistory();
  const countrySelectStyle = {
    width: "100%",
    borderRadius: "30px",
    border: "0.5px solid #414042",
    background: "#fff",
    height: "63px",
  }
  return (
    <Container>
      <img src="/images/datacommons/sdg-color-bar.png" />
      <PlaceContent>
        <PlaceSearchContainer>
          <div className="title">Explore SDG Data by Countries and Regions</div>
          <div className="search-bar-container">
            <CountrySelect setSelectedPlaceDcid={(placeDcid) => history.push(`/countries?p=${placeDcid}`)} style={countrySelectStyle}/>
          </div>
          <div className="footer">
            Learn about country and SDG region progress through the UN Data
            Commons.
          </div>
        </PlaceSearchContainer>
      </PlaceContent>
      <img src="/images/datacommons/sdg-color-bar.png" />
    </Container>
  );
};