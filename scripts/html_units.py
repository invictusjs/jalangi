# Copyright 2013 Samsung Information Systems America, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Author: Manu Sridharan

import testrunner


tests = [
    "tests/html/unit/native_function_toString",
    "tests/html/unit/window_location",
    "tests/html/unit/jq_reduced_1",
    "tests/html/jquery-2.0.2/jquery-2.0.2"
#    "tests/html/mootools/mootools-core-1.4.5-full-nocompat"
]

success = testrunner.run_tests(tests,["testrr_browser"])
if not success:
    exit(1)
