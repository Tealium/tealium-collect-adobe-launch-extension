# Tealium Collect Extension for Adobe Launch

## Overview

This is the Adobe Launch Extension for Tealium Collect data collection.

The Tealium Collect Extension for Adobe Launch allows you to enable and configure data collection for Tealium's Customer Data Hub (CDH) on your website using Adobe Launch.

For more information on Tealium's CDH, please visit [Tealium's Learning Community](https://community.tealiumiq.com/t5/Customer-Data-Hub/Introduction-to-Customer-Data-Hub/ta-p/17571)

## Quickstart Configuration

1. Search for the "Tealium Collect" Extension in the Adobe Extension Catalog
2. Click Install button to add this Extension
3. Add a Rule and Action for "Tealium Collect"
4. Enter the Tealium Account, Profile, and Data Source Key obtained from Tealium's CDH
5. Publish


## Features


1. Custom Endpoint

Configure with your first-party data collection endpoint.  Include the "/event" part of the URL.

2. Custom Data Object

This is a name of a global object to use for the data layer.  By default, the Tealium Collect tag template uses the global 'digitalData' object as the data layer. 

3. Support for Direct Call Rule with \_satellite.track

This Extension also supports tracking events that were initiated via [\_satellite.track](https://docs.adobe.com/content/help/en/launch/using/reference/client-side-info/launch-object-reference.html) function call.  The first param will be the event name and the second param will be used for the data layer.  The Tealium Collect Extension also collects the \_satellite.buildInfo information and adds to the data layer.

4. Event listener for "adobeDataLayer:event"

Option to add an event listener for all events set via [adobeDataLayer.push](https://github.com/adobe/adobe-client-data-layer).  The Adobe Client Data Layer is documented [here](https://experienceleague.adobe.com/docs/experience-manager-core-components/using/developing/data-layer/overview.html?lang=en#events).


## Copyright and license

Copyright 2021 Tealium, Inc. All rights reserved.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

