"use strict";

const Countrily = require("countrily");

let countryCodes;
let usStates;

const FormUtils = {
  init() {
    countryCodes = Countrily.shortnamesofall();
    countryCodes.sort();
    // prettier-ignore
    usStates = [ "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MH", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY" ];
  },

  loadCountriesIntoApp(app) {
    app.locals.COUNTRIES = [];
    app.locals.US_STATES = [];
    countryCodes.forEach((countryCode) => {
      if (countryCode && countryCode !== "") {
        app.locals.COUNTRIES.push({
          countryCode: countryCode,
        });
      }
    });

    usStates.forEach((state) => {
      app.locals.US_STATES.push({
        stateCode: state,
      });
    });
  },
  convertDateToTimestamp(curDate) {
    return parseInt((new Date(curDate).getTime() / 1000).toFixed(0));
  },
  convertTimestamp(timestamp) {
    const upDate = new Date(timestamp);
    const readableDate = upDate.toLocaleString("en", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    return readableDate;
  },
  getDaysFromTimestamp(ts, numDays) {
    const curDate = new Date(ts * 1000); //days to ms
    return new Date(
      curDate.getFullYear(),
      curDate.getMonth(),
      curDate.getDate() + numDays
    );
  },
};

module.exports = {
  FormUtils,
};
