<template>
  <v-container>
    <div id="app">
      <v-app id="inspire">
        <div>
          <div style="font-size: 14px;">
            <p>Please reach out to _____@chsli.org with questions.</p>
            <p>
              1) Select the Facility
              <br />2) Choose your shift by selecting the appropriate date and shift
              <br />3) Please enter the required information. You may use a CHSLI email or personal email address.
              <br />4) Once
              you select SUBMIT, you will be unable to edit. You are confirmed for that shift and should receive and email with additional information.
              <br />5) If you need to CHANGE your shift,
              please email _______@chsli.org
            </p>
          </div>
          <v-sheet tile height="54" color="grey lighten-3" class="d-flex">
            <v-btn icon class="ma-2" @click="$refs.calendar.prev()">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-select
              v-model="facility"
              :items="facilities"
              dense
              outlined
              hide-details
              label="Facility"
              class="ma-2"
              @change="forceUpdate"
            ></v-select>
            <v-select
              v-model="type"
              :items="types"
              dense
              outlined
              hide-details
              class="ma-2"
              label="View"
            ></v-select>
            <v-select
              v-model="weekday"
              :items="weekdays"
              dense
              outlined
              hide-details
              label="Weekdays"
              class="ma-2"
            ></v-select>
            <v-spacer></v-spacer>
            <v-btn icon class="ma-2" @click="$refs.calendar.next()">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-sheet>
          <v-sheet height="800">
            <v-calendar
              ref="calendar"
              v-model="value"
              :weekdays="weekday"
              :type="type"
              :events="events"
              :event-overlap-mode="mode"
              :event-overlap-threshold="30"
              :event-color="getEventColor"
              @change="getEvents"
              @click:event="showEvent"
              :key="calendarKey"
              show-month-on-first="true"
            ></v-calendar>
            <v-menu
              v-model="selectedOpen"
              :close-on-content-click="false"
              :activator="selectedElement"
              offset-x
            >
              <v-card color="grey lighten-4" min-width="350px" flat>
                <v-toolbar :color="selectedEvent.color" dark>
                  <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                  <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout">
                    {{ snackbarText }}
                    <v-btn color="black" text @click="closeSnackbar">Close</v-btn>
                  </v-snackbar>
                  <v-form v-model="valid">
                    <v-row>
                      <v-col>
                        <v-text-field
                          v-model="selectedEvent.start"
                          label="Start Date/Time"
                          disabled
                        ></v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field v-model="selectedEvent.end" label="End Date/Time" disabled></v-text-field>
                      </v-col>
                      <!--
                      <v-col>
                        <v-text-field v-model="selectedEvent.shift" label="Shift" disabled></v-text-field>
                      </v-col>
                      -->
                    </v-row>
                    <v-text-field
                      v-model="selectedEvent.firstname"
                      label="First Name"
                      :rules="nameRules"
                      :disabled="selectedEvent.id != -1"
                    ></v-text-field>
                    <v-text-field
                      v-model="selectedEvent.lastname"
                      label="Last Name"
                      :rules="nameRules"
                      :disabled="selectedEvent.id != -1"
                    ></v-text-field>
                    <v-text-field
                      v-model="selectedEvent.email"
                      label="Email"
                      :rules="emailRules"
                      :disabled="selectedEvent.id != -1"
                    ></v-text-field>
                    <v-text-field
                      v-model="selectedEvent.cell"
                      label="Cell Phone"
                      v-mask="mask"
                      :disabled="selectedEvent.id != -1"
                      :rules="phoneRules"
                    ></v-text-field>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-btn text color="secondary" @click="selectedOpen = false">Cancel</v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="saveEvent"
                    v-if="selectedEvent.id === -1"
                  >Submit</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </v-sheet>
        </div>
      </v-app>
    </div>
  </v-container>
</template>

<script>
const axios = require("axios");
//const data = require("../data/sample.json"); // TODO replaced by APIs
import { mask } from "vue-the-mask";

const url = "https://www030.chsli.org:3004/scheduling";

export default {
  name: "Scheduling",
  directives: {
    mask
  },
  data: () => ({
    data: { schedule: [], assigned: [] }, // hold all the api data
    type: "month",
    types: ["month", "week", "day", "4day"],
    mode: "stack",
    modes: ["stack", "column"],
    weekday: [0, 1, 2, 3, 4, 5, 6],
    weekdays: [
      { text: "Sun - Sat", value: [0, 1, 2, 3, 4, 5, 6] },
      { text: "Mon - Sun", value: [1, 2, 3, 4, 5, 6, 0] },
      { text: "Mon - Fri", value: [1, 2, 3, 4, 5] }
    ],
    value: "",
    events: [],
    facility: "SFH",
    selectedEvent: { id: -1, firstName: "", lastName: "", email: "", cell: "" },
    selectedElement: null,
    selectedOpen: false,
    snackbar: false,
    snackbarText: "",
    snackbarColor: "",
    snackbarMode: "", // success/error - used to figure out what to close when closing snackbar
    snackbarTimeout: 0,
    valid: false,
    emailRules: [
      v => !!v || "E-mail is required",
      v =>
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
        "E-mail must be valid"
    ],
    nameRules: [v => !!v || "Name is required"],
    phoneRules: [
      v => !!v || "Cell Phone is required",
      v => (v && v.length === 14) || "Cell Phone must be valid"
    ],
    mask: "(###) ###-####",
    calendarKey: 0
  }),
  computed: {
    facilities: function() {
      // distinct facilities
      return [...new Set(this.data.schedule.map(item => item.facility))];
    }
  },
  created() {
    this.refreshData();
  },
  beforeMount() {
    const params = window.location.search.substring(1).split("&");

    for (var i = 0; i < params.length; i++) {
      var pair = params[i].split("=");
      if (decodeURIComponent(pair[0]) === "facility") {
        this.facility = decodeURIComponent(pair[1].toUpperCase());
      }
    }
  },
  methods: {
    refreshData() {
      axios
        .get(`${url}/shifts`)
        .then(response => {
          this.data.schedule = response.data;
          return axios.get(`${url}/assignedShifts`);
        })
        .then(response => {
          this.data.assigned = response.data;
          this.forceUpdate();
        })
        .catch(err => {
          console.log("err - ", err);
        });
    },
    getEvents({ start, end }) {
      const events = [];

      const min = new Date(`${start.date}T00:00:00`);
      const max = new Date(`${end.date}T23:59:59`);
      const days = (max.getTime() - min.getTime()) / 86400000;

      let currentDateTime = min;

      for (let i = 0; i < days; i++) {
        const currentDate = currentDateTime.toISOString().split("T")[0];

        // loop thru the two shifts
        for (let k = 0; k < this.data.schedule.length; k++) {
          if (this.data.schedule[k].facility === this.facility) {
            const first = new Date(
              `${currentDate}T${this.data.schedule[k].startTime}`
            );
            const second = new Date(
              `${currentDate}T${this.data.schedule[k].endTime}`
            );

            // check if there's someone who signed up for that date
            const assignedMatch = this.data.assigned.find(elem => {
              return (
                elem.facility === this.facility &&
                elem.shift == this.data.schedule[k].shift &&
                elem.date === currentDate
              );
            });
            let matchedId = -1;
            let matchedFirstname = null;
            let matchedLastname = null;
            let matchedEmail = null;
            let matchedCell = null;

            if (assignedMatch && assignedMatch.lastname) {
              matchedId = assignedMatch.id;
              matchedFirstname = assignedMatch.firstname;
              matchedLastname = assignedMatch.lastname;
              matchedEmail = assignedMatch.email;
              matchedCell = assignedMatch.cell;
            }
            events.push({
              name: `${matchedFirstname ? matchedFirstname : ""} ${
                matchedLastname ? matchedLastname : ""
              }`,
              start: this.formatDate(first),
              end: this.formatDate(second),
              color: this.data.schedule[k].color,
              id: matchedId,
              firstname: matchedFirstname,
              lastname: matchedLastname,
              email: matchedEmail,
              cell: matchedCell,
              shift: this.data.schedule[k].shift,
              eDate: currentDate,
              facility: this.facility
            });
            events.push({
              name: `${matchedFirstname ? matchedFirstname : ""} ${
                matchedLastname ? matchedLastname : ""
              }`,
              start: this.formatDate(first),
              end: this.formatDate(second),
              color: this.data.schedule[k].color,
              id: matchedId,
              firstname: matchedFirstname,
              lastname: matchedLastname,
              email: matchedEmail,
              cell: matchedCell,
              shift: this.data.schedule[k].shift,
              eDate: currentDate,
              facility: this.facility
            });
          }
        }
        currentDateTime.setDate(min.getDate() + 1); // set the next day
      }

      this.events = events;
    },
    getEventColor(event) {
      return event.color;
    },
    formatDate(a) {
      const hours = a.getHours();
      let minutes = a.getMinutes();
      minutes = minutes < 10 ? "0" + minutes : minutes;

      return (
        a.getFullYear() +
        "-" +
        (a.getMonth() + 1) +
        "-" +
        a.getDate() +
        " " +
        hours +
        ":" +
        minutes
      );
    },
    forceUpdate() {
      // force the calendar to update
      this.calendarKey++;
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        setTimeout(() => (this.selectedOpen = true), 10);
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        setTimeout(open, 10);
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    saveEvent() {
      if (this.valid) {
        axios
          .post(`${url}/assignedShifts`, this.selectedEvent)
          .then(response => {
            this.snackbarText =
              "Thank you for your submission.  It has been saved.";
            this.snackbarColor = "success";
            this.snackbarMode = "success";
            this.snackbar = true;

            // refresh from db to get the latest updates
            this.refreshData();
          })
          .catch(err => {
            this.snackbarText = `There was a problem saving your submission.  Err - ${err}`;
            this.snackbarColor = "error";
            this.snackbarMode = "error";
            this.snackbar = true;
          });
      }
    },
    closeSnackbar() {
      this.snackbar = false;
      if (this.snackbarMode === "success") {
        this.selectedOpen = false; // close form too
      }
    }
  }
};
</script>
