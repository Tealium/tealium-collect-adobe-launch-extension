# Tealium Collect Extension for Adobe Launch

Link to Adobe Exchange Marketplace: [Tealium Collect Extension](https://exchange.adobe.com/experiencecloud.details.104217.tealium-collect-extension-for-adobe-launch.html)

## Overview

This is the Adobe Launch Extension for Tealium Collect data collection.

The Tealium Collect Extension for Adobe Launch allows you to enable and configure data collection for Tealium's Customer Data Hub (CDH) on your website using Adobe Launch.

For more information on Tealium's CDH, please visit [Tealium's Learning Community](https://community.tealiumiq.com/t5/Customer-Data-Hub/Introduction-to-Customer-Data-Hub/ta-p/17571)

## Quickstart Configuration

1. In Adobe Launch, search for the "Tealium Collect" extension in the catalog.
2. Click Install to add it to your property.
3. Add a Rule and select Tealium Collect as the Action.
4. Enter your Tealium Account, Profile, and Data Source Key (available in Tealium CDH).
5. Publish your changes.


## Features


1. Custom Endpoint

Configure the extension with your first-party Tealium data collection endpoint.
Include the /event portion of the URL, for example: https://collect.example.com/event

2. Custom Data Object

Specify the name of the global object used as your site’s data layer.
If the data layer is an array, the first element will be used.

3. Support for Direct Call Rule with \_satellite.track

* The first parameter is used as the event name.
* The second parameter is merged into the data layer and sent to Tealium Collect.
* The extension automatically includes metadata from \_satellite.buildInfo in the event payload.

4. Event listener for "adobeDataLayer:event" (Track Event Action only)

Optionally add an event listener for all events pushed via the Adobe Client Data Layer (ACDL). The Adobe Client Data Layer is documented [here](https://experienceleague.adobe.com/docs/experience-manager-core-components/using/developing/data-layer/overview.html?lang=en#events).

5. "Track Event via ACDL" Action

The extension now includes a dedicated Track Event via ACDL action for use with rules based on ACDL triggers.

How it works:

* When a rule fires, the ACDL event object (event.message) is automatically passed to Tealium Collect.
* The event name is determined in this order of priority:
** tealium_event
** event
** Launch rule name
** type
** eventName
* The extension’s configured account, profile, and data source settings are automatically applied.
* Tealium Collect is loaded once per page, and additional events are queued until it’s ready.

When to use:
* Use this action if your property already uses the ACDL extension and rules triggered by ACDL events.
* It provides rule-level control (including conditions and exclusions) rather than listening to all data layer pushes globally.


## Copyright and license

Copyright 2025 Tealium, Inc. All rights reserved.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

