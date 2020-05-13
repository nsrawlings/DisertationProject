using DissertationPhysioSite.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;
using Microsoft.AspNet.Identity;

namespace DissertationPhysioSite.Controllers
{
    [Authorize]
    public class UserController : Controller
    {
        private List<AssignedExerciseViewModal> assignedExerciseList = new List<AssignedExerciseViewModal>();
        // GET: User
        public ActionResult UserView()
        {
            return View();
        }

        [OutputCache(Location = OutputCacheLocation.None)]
        public ActionResult AssignedExerise()
        {
            assignedExerciseList = getAssignedExercises();

            return Json(assignedExerciseList, JsonRequestBehavior.AllowGet);
        }

        private List<AssignedExerciseViewModal> getAssignedExercises()
        {
            string user_ID = User.Identity.GetUserId();

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "Select * From[dbo].[AssignedExercise] INNER JOIN[dbo].[Exercises] ON[dbo].[AssignedExercise].Exercise_ID = [dbo].[Exercises].Exercise_ID Where User_ID ='" + user_ID + "';";

            string base64String;

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {

                connection.Open();
                using (SqlDataReader reader = command.ExecuteReader())
                {

                    while (reader.Read())
                    {
                        if (!reader.IsDBNull(12))
                        {
                            string imageName = reader.GetString(12);
                            byte[] data = (byte[])reader[11];
                            base64String = Convert.ToBase64String(data);
                        }
                        else
                        {
                            base64String = null;
                        }
                        if (!reader.IsDBNull(5))
                        {
                            assignedExerciseList.Add(new AssignedExerciseViewModal
                            {
                                User_Exercise_ID = reader.GetInt32(0),
                                User_ID = reader.GetString(1),
                                Exercise_ID = reader.GetInt32(2),
                                Sets = reader.GetInt32(3),
                                Repetitions = reader.GetInt32(4),
                                Exercises_ID = reader.GetInt32(6),
                                Name = reader.GetString(7),
                                Description = reader.GetString(5),
                                Type = reader.GetString(9),
                                Exercise_Group = reader.GetString(10),
                                ImageData = base64String
                            });
                        }
                        else
                        {
                            assignedExerciseList.Add(new AssignedExerciseViewModal
                            {
                                User_Exercise_ID = reader.GetInt32(0),
                                User_ID = reader.GetString(1),
                                Exercise_ID = reader.GetInt32(2),
                                Sets = reader.GetInt32(3),
                                Repetitions = reader.GetInt32(4),
                                Exercises_ID = reader.GetInt32(6),
                                Name = reader.GetString(7),
                                Description = reader.GetString(8),
                                Type = reader.GetString(9),
                                Exercise_Group = reader.GetString(10),
                                ImageData = base64String
                            });
                        }
                    }
                }
                connection.Close();
            }

            return assignedExerciseList;
        }
    }
}