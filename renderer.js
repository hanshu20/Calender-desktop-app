document.addEventListener('DOMContentLoaded', function () {

  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {

    initialView: 'dayGridMonth',

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    },

    selectable: true,
    editable: true,

    dateClick: function(info) {

      const title = prompt("Add event");

      if (title) {
        calendar.addEvent({
          title: title,
          start: info.dateStr,
          allDay: true
        });
      }

    }

  });

  calendar.render();

});
