// const { appRoles } = require("../../middleware/auth.js");

const appRoles = {
  Admin: "Admin",
  User: "User",
  HR: "HR",
};
const endPoints = {
  Profile: [appRoles.Admin, appRoles.User],
  updateName: [appRoles.HR],
};


module.exports = endPoints;