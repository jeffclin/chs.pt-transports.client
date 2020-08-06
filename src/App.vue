<template>
  <v-app>
    <v-app-bar app v-if="displayTitleField" color="primary" dark style="font-size:25px;">
      CHSLI PPE Hub Staffing Schedule
      <v-spacer></v-spacer>
      <v-col cols="3">
        <v-text-field v-if="displayField" v-model="enteredText" label="Password" filled style="height:56px;"></v-text-field>
      </v-col>
      <v-col cols="1">
        <v-btn v-if="displayField" small color="grey" @click="login">Login</v-btn>
      </v-col>
      <v-col cols="1">
        <v-btn v-if="this.buttonText == 'LOGOUT'" small color="grey" @click="report">Report</v-btn>
      </v-col>
      <v-col cols="2">
        <v-btn right small color="error" @click="login">{{ buttonText }}</v-btn>
      </v-col>
    </v-app-bar>
    <v-content>
      <Scheduling ref="scheduling" v-on:backToMain="toggleTitleField" />
    </v-content>
  </v-app>
</template>

<script>
import Scheduling from "./components/Scheduling";
const matchText = "Mercy@2020";

export default {
  name: "App",

  components: {
    Scheduling
  },

  data: () => ({
    //
    displayTitleField: true,
    displayField: false,
    buttonText: "Admin Use Only",
    enteredText: ""
  }),
  methods: {
    toggleTitleField() {
      this.displayTitleField = !this.displayTitleField;
    },
    toggleField() {
      this.displayField = !this.displayField;
    },
    report() {
      this.toggleTitleField();
      this.$refs.scheduling.rptView = true;
    },
    login() {
      // very basic
      if (this.buttonText === "Admin Use Only") {
        if (!this.displayField) {
          this.toggleField();
        } else {
          if (this.enteredText == matchText) {
            alert("Logged In");
            this.$refs.scheduling.isAdmin = true;
            this.toggleField();
            this.buttonText = "LOGOUT";
          } else {
            alert("Incorrect Password");
          }
        }
        this.enteredText = "";
      } else {
        this.$refs.scheduling.isAdmin = false;
        this.buttonText = "Admin Use Only";
      }
    }
  }
};
</script>
