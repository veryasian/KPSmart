/**
 * Created by linus on 19/05/2017.
 */
var app = angular.module('kps', []);
//list of users that can log in to KPSmart


/*Code for the sidebar opening-closing logic */
/*function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
    document.getElementById("main").style.marginLeft = "300px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}*/


app.controller('MainCtrl', function($scope, $http, $location) {

    $scope.userlist = "userlist.json"; //the list of different users

    $scope.priority = ['InternAir', 'InternStd', 'DomestAir', 'DomestStd']; //define the different types of priority
    $scope.userTypes = ['CEO', 'Manager' ,'Regular User']; //define the different types of User that can access the system.
    $scope.transportTypes = ['Land', 'Sea', 'Air']; //define the different users
    $scope.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    $scope.deliveryFields = {origin:"",destination:"",mailPriority:'InternAir',weight:"",volume:""}
    $scope.transportFields = {origin:"",destination:"",transportFirm:"",transportType:'Land',pricePerGram:"",
        pricePerCC:"",departureDay:'Monday',departsEvery:"",duration:""}
    $scope.customerPriceFields = {origin: "", destination: "", pricePerGram:"", pricePerCubic: "", mailPriority: 'InternAir'};
    $scope.discontinueRouteFields = {origin:"", destination:"", transportFirm:"", transportType:'Land' };

    $scope.buisinessFigs = {totalRevenue: "", totalExpenditure:"",eventCount: "",
        mailDelivered: "", avgDeliveryTimes:"", criticalRoutes: ""};
    $scope.stringBuisinessFigs = '{"totalRevenue": "435,545", "totalExpenditure" :"82,304,503","eventCount" : "3333", "mailDelivered" : "9876", "avgDeliveryTimes":"3984", "criticalRoutes" : "Auckland -> Incheon"}';

    if (JSON.parse(sessionStorage.getItem("events")==null)){
        //no events variable created yet, occurs only when system opened for first time of session
        sessionStorage.setItem("events",'[]');
    }

    $scope.processedEvents = JSON.parse(sessionStorage.getItem("events")); // all the events to be displayed in View Events

    // selectedEvent object format: {"eventType":"Delivery Request","origin":"a","destination":"b","mailPriority":"InternAir",
    // "weight":"1","volume":"2","date":{"day":"1","month":"2","year":"2017"}}
    $scope.selectedEvent = JSON.parse(sessionStorage.getItem("selectedEvent")); // used for displaying a single event when "View" is clicked

    //dummy values.. please change this later.


    $http.get($scope.userlist)
        .then(function sucessCall(response)	{
                $scope.userlist = response.data.users;
            },function errorCall()	{
                alert("Error reading users list.");
            }
        );


    $scope.checkLogin = function(){

        var userInput = $scope.username;
        var passwordInput = $scope.password;
        $scope.currentUser = userInput; //Used to Store the Current Users Information


        if(userInput == "" && passwordInput == ""){
            $scope.print="Please input a valid username and password";
        }else if(userInput == "" && passwordInput != ""){
            $scope.print="Please input a valid username";
        }else if(passwordInput == ""){
            $scope.print="Please input a valid password";
        }else{
            $scope.validUserName = false;
            $scope.validPassword = false;

            for(i = 0; i < $scope.userlist.length; i++){
                if($scope.userlist[i].LoginName == userInput){
                    $scope.validUserName = true;
                }

                if($scope.userlist[i].UPassword == passwordInput){
                    $scope.validPassword = true;
                }
            }
        if($scope.validUserName && $scope.validPassword){
            alert("Welcome " + userInput +", you have logged in successfully.");
            location.href='viewEvents.html';
            $scope.cancelLogin();

        }else{
            $scope.print = "Incorrect userame or password";
        }
        }
    };

    $scope.cancelLogin = function(){
        $scope.username = "";
        $scope.password = "";
    }

    $scope.setSelectedEvent = function(index){
        sessionStorage.setItem("selectedEvent", JSON.stringify($scope.processedEvents[index]));
        location.href='singleEventsView.html';
    }

    /**
     * Sends delivery request info to client.js in JSON format
     */
    $scope.sendRequestDelivery = function() {
        if ($scope.deliveryFields.origin == "" || hasNumbersandIllegals($scope.deliveryFields.origin)) {
            alert("Please enter a valid origin");
            return;
        } else if ($scope.deliveryFields.destination == "" || hasNumbersandIllegals($scope.deliveryFields.destination)) {
            alert("Please enter a valid destination");
            return;
        } else if ($scope.deliveryFields.volume == "" || !hasNumber($scope.deliveryFields.volume)) {
            alert("Please enter a valid volume number.");
            return;
        } else if ($scope.deliveryFields.weight == "" || !hasNumber($scope.deliveryFields.weight)) {
            alert("Please enter a valid weight number");
            return;
        }

        var d = new Date();
        var JSONObject = {
            "messageType":"event", "event":{"eventType":"Delivery Request","origin": $scope.deliveryFields.origin, "destination": $scope.deliveryFields.destination,
            "priority": $scope.deliveryFields.mailPriority, "weight": $scope.deliveryFields.weight, "volume":$scope.deliveryFields.volume,
            "date":{"day":d.getDate(), "month":d.getMonth()+1, "year":d.getFullYear()}
        }}

        sendData(JSONObject);
        addNewEvent(JSONObject.event);
        //receiveData(JSON.stringify(JSONObject)); // for testing only

    };
    /**
     * Sends updated transport cost info to client.js in JSON format
     */
    $scope.sendUpdatedTransportCost = function() {
        if ($scope.transportFields.origin == "" || hasNumbersandIllegals($scope.transportFields.origin)) {
            alert("Please enter a valid origin");
            return;
        } else if ($scope.transportFields.destination == "" || hasNumbersandIllegals($scope.transportFields.destination)) {
            alert("Please enter a valid destination");
            return;
        } else if ($scope.transportFields.transportFirm == "") {
            alert("Please enter a transport firm.");
            return;
        } else if ($scope.transportFields.pricePerGram == "" || !hasNumber($scope.transportFields.pricePerGram)) {
            alert("Please enter a valid price per gram.");
            return;
        } else if ($scope.transportFields.pricePerCC == "" || !hasNumber($scope.transportFields.pricePerCC)) {
            alert("Please enter a valid price per cubic cm.");
            return;
        }  else if ($scope.transportFields.departsEvery == "" || !hasNumber($scope.transportFields.departsEvery)) {
            alert("Please enter a valid departure frequency");
            return;
        } else if ($scope.transportFields.duration == "" || !hasNumber($scope.transportFields.duration)) {
            alert("Please enter a valid duration.");
            return;
        }

        var d = new Date();
        var JSONObject = {
            "messageType": "event", "event":{"eventType":"Transport Cost Update", "origin": $scope.transportFields.origin, "destination": $scope.transportFields.destination,
            "transportFirm":$scope.transportFields.transportFirm, "transportType":$scope.transportFields.transportType,
            "pricePerGram":$scope.transportFields.pricePerGram, "pricePerCC":$scope.transportFields.pricePerCC,
            "departureDay":$scope.transportFields.departureDay, "departsEvery":$scope.transportFields.departsEvery,
            "duration":$scope.transportFields.duration, "date":{"day":d.getDate(), "month":d.getMonth()+1, "year":d.getFullYear()}
        }}

        sendData(JSONObject);
        addNewEvent(JSONObject.event);
    };

    $scope.sendDiscontinueRoute = function(){
        if($scope.discontinueRouteFields.origin == ""){
            alert("Please fill out the origin field");
            return;
        }else if($scope.discontinueRouteFields.destination == ""){
            alert("Please fill out the destination field");
            return;
        }else if($scope.discontinueRouteFields.transportFirm == ""){
            alert("Please fill out the transport 'firm' field for your mail");
            return;
        }else if(hasNumbersandIllegals($scope.discontinueRouteFields.origin) || hasNumbersandIllegals($scope.discontinueRouteFields.destination) ||  hasNumbersandIllegals($scope.discontinueRouteFields.transportFirm) ){
            alert("The field must not have numerals or illegal characters inside of them");
            return;
        }

        var d = new Date();
        var JSONObject = {
             "messageType": "event", "event":{"eventType":"Discontinue Route", "origin" : $scope.discontinueRouteFields.origin, "destination" : $scope.discontinueRouteFields.destination,
             "transport firm": $scope.discontinueRouteFields.transportFirm, "transport type": $scope.discontinueRouteFields.transportType,
             "date":{"day":d.getDate(), "month":d.getMonth()+1, "year":d.getFullYear()}
        }}

        sendData(JSONObject);
        addNewEvent(JSONObject.event);
    };


    $scope.sendUpdatedCustomerPrice = function() {

        if ($scope.customerPriceFields.origin == "" || hasNumbersandIllegals($scope.customerPriceFields.origin)) {
            alert("Please fill out the origin field");
            return;
        } else if ($scope.customerPriceFields.destination == "" || hasNumbersandIllegals($scope.customerPriceFields.destination)) {
            alert("Please fill out the destination field");
            return;
        } else if ($scope.customerPriceFields.mailPriority == null) {
            alert("Please choose a mail priority.");
            return;
        }else if($scope.customerPriceFields.pricePerGram == "" || !hasNumber($scope.customerPriceFields.pricePerGram)){
            alert("Price per gram must be numerals only.");
            return;
        }else if($scope.customerPriceFields.pricePerCubic == "" || !hasNumber($scope.customerPriceFields.pricePerCubic)){
            alert("Price per cubic must be numerals only.");
            return;
        }

        var d = new Date();
        var JSONObject = {
            "messageType": "event", "event":{"eventType":"Customer Price Update", "origin":$scope.customerPriceFields.origin, "destination": $scope.customerPriceFields.destination,
            "pricePerGram": $scope.customerPriceFields.pricePerGram, "pricePerCubic": $scope.customerPriceFields.pricePerCubic,
            "mailPriority": $scope.customerPriceFields.mailPriority, "date":{"day":d.getDate(), "month":d.getMonth()+1, "year":d.getFullYear()}
        }}

        sendData(JSONObject);
        addNewEvent(JSONObject.event);
    }

    /**
     * Method that sets the business figures data from the file.
     */
    $scope.setBusinessFigs = function(){
        receiveData($scope.stringBuisinessFigs);
        var jsonobject = getJSONObject();

        if(jsonobject == null){
            alert("The JSON object being passed in from getJSONObject is null");
            return;
        }

        $scope.buisinessFigs.avgDeliveryTimes = jsonobject.avgDeliveryTimes;
        $scope.buisinessFigs.criticalRoutes = jsonobject.criticalRoutes;
        $scope.buisinessFigs.eventCount = jsonobject.eventCount;
        $scope.buisinessFigs.mailDelivered = jsonobject.mailDelivered;
        $scope.buisinessFigs.totalExpenditure = jsonobject.totalExpenditure;
        $scope.buisinessFigs.totalRevenue = jsonobject.totalRevenue;
        
    };


});


function hasNumbersandIllegals(myString) {
    var regex = /^[A-Za-z]+$/; //regex pattern that we must match
    var sht = regex.test(myString); //checks if the string matches the regex pattern
    return !sht;
}

function hasNumber(string) {
    return /\d/.test(string);
}
