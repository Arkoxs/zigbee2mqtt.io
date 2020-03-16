/**
 * This script generates the supported devices page.
 */

const devices = [...require('zigbee2mqtt/node_modules/zigbee-herdsman-converters').devices];

for (const device of devices) {
    if (device.whiteLabel) {
        for (const whiteLabel of device.whiteLabel) {
            const whiteLabelDevice = {
                ...device,
                model: whiteLabel.model,
                vendor: whiteLabel.vendor,
                whiteLabelOf: device,
            };

            delete whiteLabelDevice.whiteLabel;

            devices.push(whiteLabelDevice);
        }
    }
}

const utils = require('./utils');

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

const vendorsCount = devices.map((d) => d.vendor).filter(onlyUnique).length;

let template = `---
---
# Supported devices

<style type="text/css">
.main-content table {
  table-layout: fixed;
  display: table !important;
}
.main-content table tr th:nth-child(1) {
  width: 15%;
}
.main-content table tr th:nth-child(2) {
  width: 60%;
}
.main-content table tr th:nth-child(3) {
  width: 25%;
}
</style>

*NOTE: This file has been generated, do not edit this file manually!*

Currently **${devices.length}** devices are supported from **${vendorsCount}** different vendors.

In case you own a Zigbee device which is **NOT** listed here, please see
[How to support new devices](../how_tos/how_to_support_new_devices.md).

[DEVICES]
`;

const generateTable = (devices) => {
    let text = '';
    text += '| Model | Description | Picture |\n';
    text += '| ------------- | ------------- | -------------------------- |\n';
    devices = new Map(devices.map((d) => [d.model, d]));
    devices.forEach((d) => {
        const model = d.whiteLabelOf ? d.whiteLabelOf.model : d.model;
        const image = utils.getImage(model);
        let description = d.description;
        if (d.whiteLabelOf) {
            description = `${description} (white-label of ${d.whiteLabelOf.vendor} ${d.whiteLabelOf.model})`;
        }
        // eslint-disable-next-line
        text += `| [${d.model}](../devices/${utils.normalizeModel(model)}.md) | ${d.vendor} ${description} (${d.supports}) | ![${image}](${image}) |\n`;
    });

    return text;
};

// Generated devices text
let devicesText = '';
const vendors = Array.from(new Set(devices.map((d) => d.vendor)));
vendors.sort();
vendors.forEach((vendor) => {
    devicesText += `### ${vendor}\n\n`;
    devicesText += generateTable(devices.filter((d) => d.vendor === vendor));
    devicesText += '\n';
});

// Insert into template
template = template.replace('[DEVICES]', devicesText);

module.exports = template;
