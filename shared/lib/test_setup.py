# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import multiprocessing
import os
import sys

# The set up must only run once.
# This is a guard that ensures that.
_set_up_done = False


def set_up_macos_for_tests():
  """Ensure Python tests work on MacOS.

  Explicitly sets multiprocessing start method to 'fork' so tests work with
  python3.8+ on MacOS:
  https://docs.python.org/3/library/multiprocessing.html#contexts-and-start-methods

  This code must only be run once per execution.
  """
  global _set_up_done
  if _set_up_done:
    return
  _set_up_done = True
  if sys.version_info >= (3, 8) and sys.platform == "darwin":
    multiprocessing.set_start_method("fork")
    os.environ['no_proxy'] = '*'
