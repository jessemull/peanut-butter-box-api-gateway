/* eslint-disable */
const parser = require('fast-xml-parser')
const data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<AddressValidateResponse><Address ID=\"0\"><Address2>6605 N CAMPBELL AVE</Address2><City>PORTLAND</City><State>OR</State><Zip5>97217</Zip5><Zip4>4959</Zip4><DeliveryPoint>05</DeliveryPoint><CarrierRoute>C038</CarrierRoute><Footnotes>L</Footnotes><DPVConfirmation>Y</DPVConfirmation><DPVCMRA>N</DPVCMRA><DPVFootnotes>AABB</DPVFootnotes><Business>N</Business><CentralDeliveryPoint>N</CentralDeliveryPoint><Vacant>N</Vacant></Address></AddressValidateResponse>"
console.log(parser.parse(data))
