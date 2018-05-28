/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Git Bash
// --------------
// phonegap create rueda --id "ar.com.elferretero" --name "12ª Rueda de Nogocios de Ferretería y Afines" --template phonegap-template-push

// cd myApp/
// phonegap serve

// deviceID:
// deiZxzG8nMQ:APA91bF3IS-Mber3lo8mN2ZW0Yc5riNB8RwY_xjzSbdxIW6Tql-ty4jeBq2laMZrVqU09EuNxt_LT-m65eZCNQX7gKW_cdfTjg1fqkq93v8ZDMUllVtcqFVj-2Z53aKHLQtvKSABLakS

// // push
// phonegap push --deviceID deiZxzG8nMQ:APA91bF3IS-Mber3lo8mN2ZW0Yc5riNB8RwY_xjzSbdxIW6Tql-ty4jeBq2laMZrVqU09EuNxt_LT-m65eZCNQX7gKW_cdfTjg1fqkq93v8ZDMUllVtcqFVj-2Z53aKHLQtvKSABLakS --service gcm --payload '{ "data": { "title": "12ª Rueda de Negocios de Ferreterías y Afines", "message": "Bienvenido a la 12ª Rueda. Sus entrevistas ya están disponibles."} }'


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};
