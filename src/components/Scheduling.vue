<template>
  <v-container>
    <div id="app">
      <v-app id="inspire">
        <div v-if="!rptView">
          <div style="font-size: 14px;">
            <p>
              Please reach out to
              <a
                href="mailto:Kathleen.Kennedy@chsli.org"
              >Kathleen.Kennedy@chsli.org</a> with questions.
            </p>
            <p>
              1) Select the Facility
              <br />2) Choose your shift by selecting the appropriate date and shift
              <br />3) Please enter the required information. You may use a CHSLI email or personal email address.
              <br />4) Once
              you select SUBMIT, you will be unable to edit. You are confirmed for that shift and should receive and email with additional information.
              <br />5) If you need to CHANGE your shift,
              please email
              <a
                href="mailto:Kathleen.Kennedy@chsli.org"
              >Kathleen.Kennedy@chsli.org</a>
            </p>
          </div>
          <v-sheet
            style="background-color:yellow;text-align:center;height:42px;position:relative;margin-bottom:1px;"
          >
            <div
              style="font-weight:strong;bac
              kground-color:yellow;position:absolute;top:50%;transform:translateY(-50%);left:50%;"
            >{{ selectedMonth.toUpperCase() + " " + selectedYear + " - " + facility }}</div>
            <span v-html="selectedLegend"></span>
          </v-sheet>
          <v-sheet tile height="50" color="grey lighten-3" class="d-flex" style="width:100%;">
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
              style="width:20px;"
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
              style="width:30px;"
            ></v-select>
            <!--
              <v-select
              v-model="weekday"
              :items="weekdays"
              dense
              outlined
              hide-details
              label="Weekdays"
              class="ma-2"
            ></v-select>
            -->
            <v-spacer></v-spacer>
            <v-btn icon class="ma-2" @click="$refs.calendar.next()">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-sheet>
          <v-sheet height="1200">
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
                          v-model="selectedEvent.startDisplay"
                          label="Start Date/Time"
                          disabled
                        ></v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          v-model="selectedEvent.endDisplay"
                          label="End Date/Time"
                          disabled
                        ></v-text-field>
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
                      :disabled="selectedEvent.id != -1 && !isAdmin"
                    ></v-text-field>
                    <v-text-field
                      v-model="selectedEvent.lastname"
                      label="Last Name"
                      :rules="nameRules"
                      :disabled="selectedEvent.id != -1 && !isAdmin"
                    ></v-text-field>
                    <v-text-field
                      v-model="selectedEvent.email"
                      label="Email"
                      :rules="emailRules"
                      :disabled="selectedEvent.id != -1 && !isAdmin"
                      v-if="selectedEvent.id === -1 || isAdmin"
                    ></v-text-field>
                    <v-text-field
                      v-model="selectedEvent.cell"
                      label="Cell Phone"
                      v-mask="mask"
                      :disabled="selectedEvent.id != -1 && !isAdmin"
                      v-if="selectedEvent.id === -1 || isAdmin"
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
                    v-if="selectedEvent.id === -1 || isAdmin"
                  >Submit</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    right
                    text
                    color="error"
                    @click="confirmDialog = true"
                    v-if="selectedEvent.id != -1 && isAdmin"
                  >Delete</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </v-sheet>
          <v-dialog v-model="confirmDialog" persistent max-width="290">
            <v-card>
              <v-card-title class="headline">Deleting Entry?</v-card-title>
              <v-card-text>{{ `Do you want to remove the registration for ${selectedEvent.firstname} ${selectedEvent.lastname} on ${selectedEvent.startDisplay} - ${selectedEvent.endDisplay}?` }}</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey" text @click="confirmDialog = false">Cancel</v-btn>
                <v-btn color="error" text @click="deleteEvent">Delete</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
        <div v-if="rptView">
          <v-btn color="grey" @click="backToMain">Back</v-btn>
          <h2>Schedule Report</h2>
          <v-data-table
            :headers="rptHeaders"
            :items="events"
            class="elevation-1"
            disable-pagination
            hide-default-footer
            id="dataTableId"
            dense="true"
            sort-by="displaySort"
          ></v-data-table>
        </div>
      </v-app>
    </div>
  </v-container>
</template>

<script>
const axios = require("axios");
//const data = require("../data/sample.json"); // TODO replaced by APIs
import { mask } from "vue-the-mask";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const url = "https://www030.chsli.org:3004/scheduling";

export default {
  name: "Scheduling",
  directives: {
    mask
  },
  data: () => ({
    data: { schedule: [], assigned: [] }, // hold all the api data
    isAdmin: false,
    type: "month",
    types: ["month", "week", "day", "4day"],
    mode: "stack",
    modes: ["stack", "column"],
    weekday: [1, 2, 3, 4, 5, 6, 0],
    weekdays: [
      { text: "Sun - Sat", value: [0, 1, 2, 3, 4, 5, 6] },
      { text: "Mon - Sun", value: [1, 2, 3, 4, 5, 6, 0] },
      { text: "Mon - Fri", value: [1, 2, 3, 4, 5] }
    ],
    value: "",
    events: [],
    facility: "MMC",
    selectedMonth: "",
    selectedYear: "",
    selectedEvent: { id: -1, firstName: "", lastName: "", email: "", cell: "" },
    selectedElement: null,
    selectedOpen: false,
    selectedLegend: "",
    snackbar: false,
    snackbarText: "",
    snackbarColor: "",
    snackbarMode: "", // success/error - used to figure out what to close when closing snackbar
    snackbarTimeout: 0,
    confirmDialog: false,
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
    calendarKey: 0,
    rptView: false,
    rptHeaders: [
      {
        text: "Date",
        value: "startDateDisplay"
      },
      {
        text: "Start Time",
        value: "startTimeDisplay"
      },
      {
        text: "End Time",
        value: "endTimeDisplay"
      },
      { text: "Lastname", value: "lastname" },
      { text: "Firstname", value: "firstname" },
      { text: "Email", value: "email" },
      { text: "Cell #", value: "cell" }
    ]
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

      this.selectedMonth = monthNames[min.getMonth()]; // for display
      this.selectedYear = min.getFullYear(); // for display

      // filter current facility schedule
      const facSchedule = this.data.schedule.filter(
        elem => elem.facility === this.facility
      );

      // generate the legend, but i want multiples of the same shift
      let tmpShiftsLegend = []; // store shifts that have already been added to legend.  based on 1st char of shift
      this.selectedLegend = `<div style="float:right;font-size:14px;margin-right:10px;margin-top:2px;">`;
      for (let k = 0; k < facSchedule.length; k++) {
        if (
          tmpShiftsLegend.filter(elem => elem == facSchedule[k].shift.charAt(0))
            .length === 0
        ) {
          const sTime = new Date(`${start.date}T${facSchedule[k].startTime}`);
          const eTime = new Date(`${start.date}T${facSchedule[k].endTime}`);

          this.selectedLegend += `<div><div class="legend" style="background-color:${
            facSchedule[k].color
          };"></div>${this.formatTimeUS(sTime)} - ${this.formatTimeUS(
            eTime
          )}</div>`;

          tmpShiftsLegend.push(facSchedule[k].shift.charAt(0));
        }
      }
      this.selectedLegend += "</div>";

      for (let i = 0; i < days; i++) {
        const currentDate = currentDateTime.toISOString().split("T")[0];

        // loop thru the shifts
        for (let k = 0; k < facSchedule.length; k++) {
          const first = new Date(`${currentDate}T${facSchedule[k].startTime}`);
          const second = new Date(`${currentDate}T${facSchedule[k].endTime}`);
          const firstTime = new Date(
            `${start.date}T${facSchedule[k].startTime}`
          ); // for use for reporting
          const secondTime = new Date(
            `${start.date}T${facSchedule[k].endTime}`
          ); // for use for reporting

          const dataTableId = i + "-" + k;

          // check if there's someone (up to two) who signed up for that date
          const assignedMatch = this.data.assigned.filter(elem => {
            return (
              elem.facility === this.facility &&
              elem.shift == facSchedule[k].shift &&
              elem.date === currentDate
            );
          });

          let matchedId = -1;
          let matchedFirstname = null;
          let matchedLastname = null;
          let matchedEmail = null;
          let matchedCell = null;

          if (assignedMatch[0] && assignedMatch[0].lastname) {
            matchedId = assignedMatch[0].id;
            matchedFirstname = assignedMatch[0].firstname;
            matchedLastname = assignedMatch[0].lastname;
            matchedEmail = assignedMatch[0].email;
            matchedCell = assignedMatch[0].cell;
          }
          events.push({
            name: `${matchedFirstname ? matchedFirstname : ""} ${
              matchedLastname ? matchedLastname : ""
            }`,
            start: this.formatDate(first),
            end: this.formatDate(second),
            startDisplay: this.formatDateUS(first),
            endDisplay: this.formatDateUS(second),
            startDateDisplay: this.formatDateUS(first).split(" ")[0],
            startTimeDisplay: this.formatTimeUS(firstTime),
            endTimeDisplay: this.formatTimeUS(secondTime),
            color: facSchedule[k].color,
            id: matchedId,
            firstname: matchedFirstname,
            lastname: matchedLastname,
            email: matchedEmail,
            cell: matchedCell,
            shift: facSchedule[k].shift,
            eDate: currentDate,
            facility: this.facility,
            dataTableId: dataTableId,
            displaySort: currentDate + facSchedule[k].shift
          });
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
    formatDateUS(a) {
      const strTime = this.formatTimeUS(a);

      return (
        a.getMonth() +
        1 +
        "-" +
        a.getDate() +
        "-" +
        a.getFullYear() +
        " " +
        strTime
      );
    },
    formatTimeUS(a) {
      let hours = a.getHours();
      let minutes = a.getMinutes();
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? "0" + minutes : minutes;

      return hours + ":" + minutes + " " + ampm;
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
    deleteEvent() {
      // just admins see this so just using alerts for now
      axios
        .post(`${url}/deleteShifts`, this.selectedEvent)
        .then(response => {
          this.confirmDialog = false;
          alert("The Entry has been removed.");

          // refresh from db to get the latest updates
          this.refreshData();
        })
        .catch(err => {
          this.confirmDialog = false;
          alert("There was a problem deleting the entry.  Err - ", err);

          // refresh from db to get the latest updates
          this.refreshData();
        });
    },
    closeSnackbar() {
      this.snackbar = false;
      if (this.snackbarMode === "success") {
        this.selectedOpen = false; // close form too
      }
    },
    backToMain() {
      this.rptView = false;
      this.$emit("backToMain");
    }
  }
};
</script>
<style>
.legend {
  float: left;
  width: 20px;
  height: 10px;
  margin: 5px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
