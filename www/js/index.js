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
var app = {
	// Application Constructor
	initialize: function() {
		this.modLoader = new ModLoader('base 0.16.36', this.onModLoaded.bind(this));
		this.factorioEnvironment = this.modLoader.environment();
		this.ratioSolver = new factorio.RatioSolver(this.factorioEnvironment);
		document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		document.addEventListener('fileutilready', this.onFileUtilReady.bind(this), false)
	},

	reloadMod: function() {
		this.modLoader.reset();
		this.factorioEnvironment = this.modLoader.environment();
		this.ratioSolver = new factorio.RatioSolver(this.factorioEnvironment);
		this.preferences.ratioSolver = this.ratioSolver;
		this.preferences.mod = this.modLoader.mod;
		console.log('Firing "modsunloaded" event');
		cordova.fireDocumentEvent('modsunloaded');
		this.modLoader.loadMod();
	},

	// deviceready Event Handler
	//
	// Bind any cordova events here. Common events are:
	// 'pause', 'resume', etc.
	onDeviceReady: function() {
		console.log('Recieved "deviceready" event');
		this.receivedEvent('deviceready');
	},

	onModLoaded: function() {
		console.log('Firing "modsloaded" event');
		cordova.fireDocumentEvent('modsloaded');
		this.preferences.apply();
		console.log("Applied preferences");
	},

	onFileUtilReady: function() {
		self = this;
		Preferences.fromJSON(this.ratioSolver, "preferences.json",
			function(pref) {
				self.preferences = pref;
				self.modLoader.mods = pref.mods;
				console.log("Loaded preferences " + self.preferences);
				self.reloadMod();
			},
			function(error) {
				console.warn("Could not access preferences.json: " + error);
				self.preferences = new Preferences(self.ratioSolver, "preferences.json");
				self.reloadMod();
			}
		);
	},

	// Update DOM on a Received Event
	receivedEvent: function(id) {
		var parentElement = document.getElementById(id);

		console.log('Received Event: ' + id);
	}
};

app.initialize();

var assert = function(condition, message = "Assertion failed") {
	if (!condition) {
		throw message;
	}
}
