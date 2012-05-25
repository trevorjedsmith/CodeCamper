﻿// Depends on 
//	Knockout
// 	toastr
//	app.datacontext
//  app.filter
//  app.sort
//  app.config
//
// Description
//  vm.favorites is the ViewModel for a view displaying just the sessions
//  that the current user has marked as favorites.
//  The user can further filter this subset of Sessions by additional criteria,
//  the same filter criteria that can be applied to all sessions.
//
// ----------------------------------------------
app.vm = app.vm || {}

app.vm.favorites = (function (ko, toastr, datacontext, filter, sort, config, group) {
    var selectedDate,
        searchText = ko.observable().extend({ throttle: config.throttle }),
        sessionFilter = new filter.SessionFilter(),
        timeslots = ko.observableArray(),
        sessions = ko.observableArray(), //.trackReevaluations(),
        days = ko.computed(function () { return group.timeslotsToDays(timeslots()) }),
        getTimeslots = function () {
            datacontext.timeslots.getData({
                results: timeslots,
                sortFunction: sort.timeslotSort
            });
        },
        activate = function() { //routeData) { //TODO: routeData is not used. Remove it later.
            getTimeslots()
        },
        setFilter = function() {
            var day = new Date(selectedDate),
                maxDate = moment(new Date(day)).add('days', 1).add('seconds', -1).toDate()

            sessionFilter.minTimeSlot(day)
                .maxTimeSlot(maxDate)
                .favoriteOnly(true)
                .searchText(searchText())
        },
        setSelectedDay = function () {
            // keeping nav in synch too
            for (var i = 0; i < days().length; i++) {
                var day = days()[i]
                day.isSelected(false)
                if (day.date === selectedDate) {
                    day.isSelected(true)
                }
            }
        },
        loadByDate = function (data) {
            getTimeslots()

            selectedDate = data && data.date ? data.date : selectedDate
            if (!selectedDate) return

            setSelectedDay()
            
            setFilter()
            datacontext.sessions.getData({
                results: sessions,
                filter: sessionFilter,
                sortFunction: sort.sessionSort
            });
        },
        debugInfo = app.debugInfo(sessions);
    return {
        sessions: sessions,
        timeslots: timeslots,
        searchText: searchText,
        days: days,
        activate: activate,
        loadByDate: loadByDate,
        debugInfo: debugInfo,
    }
})(ko, toastr, app.datacontext, app.filter, app.sort, app.config, app.group);

app.vm.favorites.searchText.subscribe(function() {
    app.vm.favorites.loadByDate()
})
