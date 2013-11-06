// Copyright Collab 2012-2013

define([
  'module',
  'jquery',
  'underscore',
  'underscoreString',
  'backbone',
  'i18n!app/nls/status',
], function(module, $, _, _s, Backbone, lang){

	var statusView = Backbone.View.extend(
	{
		el: $("#status-panel"),

	    initialize: function()
	    { 
	    	this.total_users = 1;
	    	this.messages = [];
	    	this.maxTime = 2000;
		},

		/*
		 * Reset label to active users.
		 */
		resetLabel: function()
		{
			// show active users
			var result = _.str.sprintf(lang.active_users, this.total_users);
			this.$el.find("span").text(result);
			
			// stop timer
			clearTimeout(this.rotate_timer);
		},

		/*
		 * Update the status panel.
		 */
		updateStatus: function()
		{
			// reset message after x seconds
			clearTimeout(this.rotate_timer);
			this.rotate_timer = setTimeout(_.bind(this.resetLabel, this),
					                       this.maxTime);

			var label = this.messages[0];
			this.messages.shift();

			// update span
			this.$el.find("span").text(label);
		},

		/*
	     * Add new queued message to status display.
	     * 
	     * @param label:
	     */
	    addMessage: function(label)
	    {
	    	this.messages.push(label);
	    	this.updateStatus();
	    },

		/*
		 * Renders the view.
		 */
	    render: function(category)
	    {
	    	this.$el.html("<span></span>");
	    }
	});

	return new statusView;

});