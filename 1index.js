//classes for the appointment and appointment type, as well as the array for the appointment type

class Appointment {
  constructor(name) {
    this.name = name;
    this.type = [];
  }

  addType(name, location) {
    this.types.push(new Type(name, location));
  }
}

class Type {
  constructor(name, location) {
    this.name = name;
    this.location = location;
  }
}

//API url, made sure it renders into the api

class AppointmentService {
  static url = "https://63c1bf9d99c0a15d28f169b6.mockapi.io/PhotoAppointments";

  static getAllAppointments() {
    return $.get(this.url);
  }

  static getAppointment(id) {
    return $.get(`${this.url}/${id}`);
  }

  static createAppointment(appointment) {
    return $.post(this.url, appointment);
  }

  static updateAppointment(appointment) {
    return $.ajax({
      url: `${this.url}/${appointment._id}`,
      dataType: "json",
      data: JSON.stringify(appointment),
      contentType: "application/json",
      type: "PUT",
    });
  }

  static deleteAppointment(id) {
    return $.ajax({
      url: `${this.url}/${id}`,
      type: "DELETE",
    });
  }
}

//render the functions into the application
class DOMManager {
  static appointments;

  static getAllAppointments() {
    AppointmentService.getAllAppointments().then((appointments) =>
      this.render(appointments)
    );
  }

  static createAppointment(name) {
    AppointmentService.createAppointment(new Appointment(name))
      .then(() => AppointmentService.getAllAppointments())
      .then((appointments) => this.render(appointments));
  }

  static deleteAppointment(id) {
    AppointmentService.deleteAppointment(id).then(() =>
      AppointmentService.getAllAppointments().then((appointments) =>
        this.render(appointments)
      )
    );
  }

  static addType(id) {
    for (let appointment of this.appointments) {
      if (appointment._id == id) {
        appointment.types.push(
          new Type(
            $(`#${appointment._id}-type-name`).val(),
            $(`#${appointment._id}-type-location`).val()
          )
        );
        AppointmentService.updateAppointment(appointment)
          .then(() => AppointmentService.getAllAppointments())
          .then((appointments) => this.render(appointments));
      }
    }
  }

  static deleteType(appointmentId, typeId) {
    for (let appointment of this.appointments) {
      if (appointment._id == appointmentId) {
        for (let type of appointment.types) {
          if (type._id == typeId) {
            appointment.types.splice(appointment.types.indexOf(type, 1));
            AppointmentService.updateAppointment(appointment)
              .then(() => AppointmentService.getAllAppointments())
              .then((appointments) => this.render(appointments));
          }
        }
      }
    }
  }

  static render(appointments) {
    this.appointments = appointments;
    $("#app").empty();
    for (let appointment of appointments) {
      $("#app").prepend(`
          <div id="${appointment._id}" class=="card">
            <div class="card-header">
              <h2>${appointment.name}</h2>
              <button class="btn btn-danger" onclick="DOMManager.deleteAppointment('${appointment._id}')">Delete</button>
            </div>
            <div class="card-body">
              <div class="card">
                <div class="row">
                  <div class="col-sm">
                    <input type="text" id="${appointment._id}-type-name" class="form-control" placeholder="Photo Type">
                  </div>
                  <div class="col-sm">
                       <input type="text" id="${appointment._id}-type-location" class="form-control" placeholder="Photo Location">
                  </div>
                </div>
                <button id="${appointment._id}-new-Type" onclick="DOMManager.addType('${appointment._id}')" class="btn btn-primary form-control">Add</button>
              </div>
            </div>
          </div>
          <br />
          `);

      for (let type of appointment.types) {
        $(`#${appointment._id}`)
          .find(".card-body")
          .append(
            `<p>
                <span id="name-${type._id}"><strong>Name: </strong> ${type.name}</span>
                <span id="name-${type._id}"><strong>Location: </strong> ${type.location}</span>
                <button class="btn btn-danger" onclick="DOMManager.deleteType('${appointment._id}','${type._id}')">Delete Photo Type</button>
              </p>
              `
          );
      }
    }
  }
}

//create new appointment
$("#create-new-appointment").click(() => {
  DOMManager.createAppointment($("#new-appointment-name").val());
  $("#new-appointment-name").val("");
});

//get all appointments on first render
DOMManager.getAllAppointments();
