using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace DissertationPhysioSite
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Exercises",
                url: "exercises",
                defaults: new { controller = "Staff", action = "Exercises" }
            );

            routes.MapRoute(
                name: "UpdateExerciseEmail",
                url: "updateexerciseemail",
                defaults: new { controller = "Staff", action = "UpdateExerciseEmail" }
            );

            routes.MapRoute(
                name: "AssignedPatientsExersies",
                url: "patientsexersies",
                defaults: new { controller = "Staff", action = "AssignedPatientsExersies" }
            );

            routes.MapRoute(
                name: "GetUserRole",
                url: "getrole",
                defaults: new { controller = "Staff", action = "GetUserRole" }
            );

            routes.MapRoute(
                name: "AssignedPatients",
                url: "assignedpatients",
                defaults: new { controller = "Staff", action = "AssignedPatients" }
            );

            routes.MapRoute(
                name: "AllAssignedPatients",
                url: "allassignedpatients",
                defaults: new { controller = "Staff", action = "AllAssignedPatients" }
            );

            routes.MapRoute(
                name: "UnassignedPatients",
                url: "unassignedpatients",
                defaults: new { controller = "Staff", action = "UnassignedPatients" }
            );

            routes.MapRoute(
                name: "AssignPatients",
                url: "assignpatients",
                defaults: new { controller = "Staff", action = "AssignPatients" }
            );

            routes.MapRoute(
                name: "EditExercise",
                url: "editexercise",
                defaults: new { controller = "Staff", action = "EditExercise" }
            );

            routes.MapRoute(
                name: "EditAssignedExercise",
                url: "editassignedexercise",
                defaults: new { controller = "Staff", action = "EditAssignedExercise" }
            );

            routes.MapRoute(
                name: "DeleteExercise",
                url: "deleteexercise",
                defaults: new { controller = "Staff", action = "DeleteExercise" }
            );

            routes.MapRoute(
                name: "AddExercise",
                url: "addexercise",
                defaults: new { controller = "Staff", action = "AddExercise" }
            );

            routes.MapRoute(
                name: "AssignExercise",
                url: "assignexercise",
                defaults: new { controller = "Staff", action = "AssignExercise" }
            );

            routes.MapRoute(
                name: "UnassignExercise",
                url: "unassignexercise",
                defaults: new { controller = "Staff", action = "UnassignExercise" }
            );

            routes.MapRoute(
                name: "AssignedExerise",
                url: "assignedexerise",
                defaults: new { controller = "User", action = "AssignedExerise" }
            );

            routes.MapRoute(
                name: "StaffQuerry",
                url: "staffquerry",
                defaults: new { controller = "Staff", action = "StaffQuerry" }
            );

            routes.MapRoute(
                name: "RemoveStaff",
                url: "removestaff",
                defaults: new { controller = "Staff", action = "RemoveStaff" }
            );

            routes.MapRoute(
                name: "SetUserToStaff",
                url: "setusertostaff",
                defaults: new { controller = "Staff", action = "SetUserToStaff" }
            );

            routes.MapRoute(
                name: "AssignStaffToAdmin",
                url: "assignadmin",
                defaults: new { controller = "Staff", action = "AssignStaffToAdmin" }
            );

            routes.MapRoute(
                name: "UnassignStaffToAdmin",
                url: "unassignadmin",
                defaults: new { controller = "Staff", action = "UnassignStaffToAdmin" }
            );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
