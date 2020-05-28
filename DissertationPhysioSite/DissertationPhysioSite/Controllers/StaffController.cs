using DissertationPhysioSite.Models;
using Microsoft.AspNet.Identity;
using Newtonsoft.Json;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;
using System.Web.UI;
using System.Web.UI.HtmlControls;

namespace DissertationPhysioSite.Controllers
{
    [Authorize(Roles = "Staff,Admin")]
    public class StaffController : Controller
    {
        private List<ExercisesViewModel> exerciseList = new List<ExercisesViewModel>();
        private List<StaffViewModel> staffList = new List<StaffViewModel>();
        private List<PatientModelView> assignedPatientList = new List<PatientModelView>();
        private List<PatientModelView> assignedMyPatientList = new List<PatientModelView>();
        private List<PatientModelView> unassignedPatientList = new List<PatientModelView>();
        private List<PatientModelView> allAssignedPatientList = new List<PatientModelView>();

        private List<AssignedExerciseViewModal> patientExerciseList = new List<AssignedExerciseViewModal>();
        private List<PatientExeriseModel> allPatientExerciseList = new List<PatientExeriseModel>();

        // GET: Staff
        public async Task<ActionResult> Staff()
        {
            ViewBag.Message = "Your Staff page.";

            return View();
        }

        [OutputCache(Location = OutputCacheLocation.None)]
        public async Task<ActionResult> Exercises()
        {
            exerciseList = await getExercises();

            return Json(exerciseList, JsonRequestBehavior.AllowGet);
        }

        [OutputCache(Location = OutputCacheLocation.None)]
        public async Task<ActionResult> AssignedPatientsExersies()
        {
            allPatientExerciseList = await getPatientsExercises();

            return Json(allPatientExerciseList, JsonRequestBehavior.AllowGet);
        }

        [Authorize(Roles = "Admin")]
        [OutputCache(Location = OutputCacheLocation.None)]
        public async Task<ActionResult> StaffQuerry()
        {
            staffList = await getStaff();

            return Json(staffList, JsonRequestBehavior.AllowGet);
        }

        [OutputCache(Location = OutputCacheLocation.None)]
        public async Task<ActionResult> AssignedPatients()
        {
            assignedPatientList = await getAssignedPatients();

            return Json(assignedPatientList, JsonRequestBehavior.AllowGet);
        }

        [OutputCache(Location = OutputCacheLocation.None)]
        public async Task<ActionResult> AllAssignedPatients()
        {
            allAssignedPatientList = await getAllAssignedPatients();

            return Json(allAssignedPatientList, JsonRequestBehavior.AllowGet);
        }

        [OutputCache(Location = OutputCacheLocation.None)]
        public async Task<ActionResult> UnassignedPatients()
        {
            unassignedPatientList = await getUnassignedPatients();

            return Json(unassignedPatientList, JsonRequestBehavior.AllowGet);
        }

        [OutputCache(Location = OutputCacheLocation.None)]
        public async Task<ActionResult> GetUserRole()
        {
            string role;
            if (User.IsInRole("Staff"))
            {
                role = "Staff";
            }

            else if (User.IsInRole("Admin"))
            {
                role = "Admin";
            }

            else
            {
                role = "User";
            }

            
           return Json(role, JsonRequestBehavior.AllowGet);
        }

        private async Task<List<ExercisesViewModel>> getExercises()
        {
            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "SELECT * FROM [dbo].[Exercises];";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                connection.Open();
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        if (!reader.IsDBNull(6))
                        {
                            string imageName = reader.GetString(6);
                            byte[] data = (byte[])reader[5];
                            string base64String = Convert.ToBase64String(data);

                            exerciseList.Add(new ExercisesViewModel
                            {
                                Exercises_ID = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                Description = reader.GetString(2),
                                Type = reader.GetString(3),
                                Exercise_Group = reader.GetString(4),
                                Image = base64String
                            });
                        }
                        else
                        {
                            exerciseList.Add(new ExercisesViewModel
                            {
                                Exercises_ID = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                Description = reader.GetString(2),
                                Type = reader.GetString(3),
                                Exercise_Group = reader.GetString(4),
                                Image = null
                            });
                        }
                    }
                }
                connection.Close();
            }

            return exerciseList;
        }

        [HttpPost]
        public async Task AddExercise()
        {
            string[] keys = Request.Form.AllKeys;

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            //var image = 

            HttpPostedFileBase file = Request.Files["image"]; //Uploaded file
                                                        //Use the following properties to get file's name, size and MIMEType
            int fileSize = file.ContentLength;
            string fileName = file.FileName;
            string mimeType = file.ContentType;

            MemoryStream target = new MemoryStream();
            file.InputStream.CopyTo(target);
            byte[] photo = target.ToArray();

            string cmd = "INSERT INTO[dbo].[Exercises](Name, Description, Type, Exercise_Group, Image, ImageName, ImageType) VALUES(@Name, @Description, @Type, @ExerciseGroup, @Image, @ImageName, @ImageType);";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                command.Parameters.Add("@Name", SqlDbType.VarChar, 50).Value = Request.Form[keys[0]];
                command.Parameters.Add("@Description", SqlDbType.NVarChar).Value = Request.Form[keys[1]];
                command.Parameters.Add("@Type", SqlDbType.VarChar, 50).Value = Request.Form[keys[2]];
                command.Parameters.Add("@ExerciseGroup", SqlDbType.VarChar, 50).Value = Request.Form[keys[3]];
                command.Parameters.Add("@Image", SqlDbType.Image, photo.Length).Value = photo;
                command.Parameters.Add("@ImageName", SqlDbType.NVarChar).Value = fileName;
                command.Parameters.Add("@ImageType", SqlDbType.VarChar, 20).Value = mimeType;

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }
        }

        public async Task EditExercise()
        {
            string[] keys = Request.Form.AllKeys;
            //for (int i = 0; i < keys.Length; i++)
            //{
            //    System.Diagnostics.Debug.WriteLine(Request.Form[keys[i]]);
            //}

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "UPDATE [dbo].[Exercises] SET Name = @Name, Description = @Description, Type = @Type, Exercise_Group = @ExerciseGroup WHERE Exercise_ID = @ExerciseID;";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                command.Parameters.Add("@ExerciseID", SqlDbType.Int).Value = Request.Form[keys[0]];
                command.Parameters.Add("@Name", SqlDbType.NVarChar, 128).Value = Request.Form[keys[1]];
                command.Parameters.Add("@Description", SqlDbType.NVarChar, 128).Value = Request.Form[keys[2]];
                command.Parameters.Add("@Type", SqlDbType.NVarChar, 128).Value = Request.Form[keys[3]];
                command.Parameters.Add("@ExerciseGroup", SqlDbType.NVarChar, 128).Value = Request.Form[keys[4]];

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }
        }

        public async Task EditAssignedExercise()
        {
            string[] keys = Request.Form.AllKeys;

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "UPDATE [dbo].[AssignedExercise] SET Sets = @Sets, Repition = @Repition, Personal_Description = @Personal_Description WHERE Assigned_Id = @Assigned_ID;";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                command.Parameters.Add("@Assigned_ID", SqlDbType.Int).Value = Request.Form[keys[0]];
                command.Parameters.Add("@Sets", SqlDbType.Int).Value = Request.Form[keys[1]];
                command.Parameters.Add("@Repition", SqlDbType.Int).Value = Request.Form[keys[2]];
                command.Parameters.Add("@Personal_Description", SqlDbType.NVarChar).Value = Request.Form[keys[3]];

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }
        }

        public async Task AssignPatients()
        {
            string[] keys = Request.Form.AllKeys;

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string staffID = Request.Form[keys[0]];

            string cmd = "UPDATE [dbo].[Patients] SET AssignedStaffID = @StaffID WHERE UserID = @UserID;";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                if(staffID == "NULL")
                {
                    command.Parameters.Add("@StaffID", DBNull.Value);
                }
                else
                {
                    command.Parameters.Add("@StaffID", SqlDbType.Int).Value = Request.Form[keys[0]];
                }
                command.Parameters.Add("@UserID", SqlDbType.NVarChar, 128).Value = Request.Form[keys[1]];

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }
        }

        public async Task AssignExercise()
        {
            string[] keys = Request.Form.AllKeys;
            for (int i = 0; i < keys.Length; i++)
            {
                System.Diagnostics.Debug.WriteLine(Request.Form[keys[i]]);
            }

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "INSERT INTO [dbo].[AssignedExercise] (User_ID, Exercise_ID, Sets, Repition) VALUES(@User_ID, @Exerice_ID, @Sets, @Repitions);";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                command.Parameters.Add("@User_ID", SqlDbType.NVarChar, 128).Value = Request.Form[keys[0]];
                command.Parameters.Add("@Exerice_ID", SqlDbType.Int).Value = Request.Form[keys[1]];
                command.Parameters.Add("@Sets", SqlDbType.Int).Value = Request.Form[keys[2]];
                command.Parameters.Add("@Repitions", SqlDbType.Int).Value = Request.Form[keys[3]];

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }
        }

        public async Task DeleteExercise()
        {
            string[] keys = Request.Form.AllKeys;

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "DELETE FROM [dbo].[Exercises] WHERE Exercise_ID=@id;";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                command.Parameters.Add("@id", SqlDbType.Int).Value = Request.Form[keys[0]];

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }
        }

        public async Task UnassignExercise()
        {
            string[] keys = Request.Form.AllKeys;

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "DELETE FROM [dbo].[AssignedExercise] WHERE Assigned_Id=@id;";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                command.Parameters.Add("@id", SqlDbType.Int).Value = Request.Form[keys[0]];

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }
        }

        public async Task<List<PatientModelView>> getAssignedPatients()
        {
            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "Select * From [dbo].[Patients] Where AssignedStaffID = " + getStaffID() + ";";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {

                connection.Open();
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        assignedPatientList.Add(new PatientModelView
                        {
                            UserID = reader.GetString(1),
                            FirstName = reader.GetString(2),
                            LastName = reader.GetString(3),
                        });
                    }
                }
                connection.Close();
            }

            return assignedPatientList;
        }

        private async Task<List<PatientExeriseModel>> getPatientsExercises()
        {
            assignedMyPatientList = await getAssignedPatients();

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            string base64String;

            SqlConnection connection = new SqlConnection(conn);

            for (int i = 0; i < assignedMyPatientList.Count(); i++)
            {
                string user_ID = assignedMyPatientList[i].UserID;

                string cmd = "Select * From[dbo].[AssignedExercise] INNER JOIN[dbo].[Exercises] ON[dbo].[AssignedExercise].Exercise_ID = [dbo].[Exercises].Exercise_ID Where User_ID ='" + user_ID + "';";

                List<AssignedExerciseViewModal> newPatientExerciseList = new List<AssignedExerciseViewModal>();

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
                                newPatientExerciseList.Add(new AssignedExerciseViewModal
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
                                newPatientExerciseList.Add(new AssignedExerciseViewModal
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

                PatientExeriseModel patientExerise = new PatientExeriseModel();
                patientExerise.PatientID = user_ID;
                patientExerise.PatientExercise = newPatientExerciseList;

                allPatientExerciseList.Add(patientExerise);
            }

            return allPatientExerciseList;
        }

        public async Task<List<PatientModelView>> getAllAssignedPatients()
        {
            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "Select [dbo].[Patients].UserID, [dbo].[Patients].FirstName, [dbo].[Patients].LastName, [dbo].[Staff].FirstName, [dbo].[Staff].LastName From [dbo].[Patients] INNER JOIN [dbo].[Staff] ON [dbo].[Patients].AssignedStaffID = [dbo].[Staff].Id Where AssignedStaffID IS NOT NULL;";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {

                connection.Open();
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        allAssignedPatientList.Add(new PatientModelView
                        {
                            UserID = reader.GetString(0),
                            FirstName = reader.GetString(1),
                            LastName = reader.GetString(2),
                            StaffFirstName = reader.GetString(3),
                            StaffLastName = reader.GetString(4),
                        });
                    }
                }
                connection.Close();
            }

            return allAssignedPatientList;
        }

        public async Task<List<PatientModelView>> getUnassignedPatients()
        {
            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "Select * From [dbo].[Patients] Where AssignedStaffID IS NULL;";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {

                connection.Open();
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        unassignedPatientList.Add(new PatientModelView
                        {
                            UserID = reader.GetString(1),
                            FirstName = reader.GetString(2),
                            LastName = reader.GetString(3),
                        });
                    }
                }
                connection.Close();
            }

            return unassignedPatientList;
        }

        private int getStaffID()
        {
            string user_ID = User.Identity.GetUserId();

            int staffId = 0;

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "Select Id From [dbo].[Staff] Where UserID = '" + user_ID +"';";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {

                connection.Open();
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        staffId = reader.GetInt32(0);
                    }
                }
                connection.Close();
            }

            return staffId;
        }

        private async Task<List<StaffViewModel>> getStaff()
        {
            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "SELECT * FROM [dbo].[AspNetUserRoles] INNER JOIN [dbo].[Staff] ON [dbo].[AspNetUserRoles].UserId = [dbo].[Staff].UserID;";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                connection.Open();
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        staffList.Add(new StaffViewModel {
                            Role_ID = reader.GetString(1),
                            Staff_ID = reader.GetInt32(2),
                            UserID = reader.GetString(3),
                            FirstName = reader.GetString(4), 
                            LastName = reader.GetString(5),
                            Role = reader.GetString(6)});
                    }
                }
                connection.Close();
            }

            return staffList;
        }

        [Authorize(Roles = "Admin")]
        public async Task RemoveStaff()
        {
            string[] keys = Request.Form.AllKeys;

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "DELETE FROM [dbo].[Staff] WHERE UserID = @UserID;";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                command.Parameters.Add("@UserID", SqlDbType.NVarChar, 128).Value = Request.Form[keys[0]];

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }

            string cmd2 = " DELETE FROM[dbo].[AspNetUserRoles] WHERE UserId = @UserID;";

            using (SqlCommand command = new SqlCommand(cmd2, connection))
            {
                command.Parameters.Add("@UserID", SqlDbType.NVarChar, 128).Value = Request.Form[keys[0]];

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }

            string cmd3 = "INSERT INTO [dbo].[Patients] (UserId, FirstName, LastName) VALUES (@UserID, @FirstName, @LastName);";

            using (SqlCommand command = new SqlCommand(cmd3, connection))
            {
                command.Parameters.Add("@UserID", SqlDbType.NVarChar, 128).Value = Request.Form[keys[0]];
                command.Parameters.Add("@FirstName", SqlDbType.NVarChar).Value = Request.Form[keys[1]];
                command.Parameters.Add("@LastName", SqlDbType.NVarChar).Value = Request.Form[keys[2]];

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }
        }

        [Authorize(Roles = "Admin")]
        public async Task SetUserToStaff()
        {
            string[] keys = Request.Form.AllKeys;

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "DELETE FROM [dbo].[Patients] WHERE UserID = @UserID;";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                command.Parameters.Add("@UserID", SqlDbType.NVarChar, 128).Value = Request.Form[keys[0]];

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }

            string cmd2 = "INSERT INTO [dbo].[AspNetUserRoles] (UserId, RoleId) VALUES (@UserID, @RoleId);";

            using (SqlCommand command = new SqlCommand(cmd2, connection))
            {
                command.Parameters.Add("@UserID", SqlDbType.NVarChar, 128).Value = Request.Form[keys[0]];
                command.Parameters.Add("@RoleId", SqlDbType.Int).Value = 2;

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }

            string cmd3 = "INSERT INTO [dbo].[Staff] (UserId, FirstName, LastName, Role) VALUES (@UserID, @FirstName, @LastName, @Role);";

            using (SqlCommand command = new SqlCommand(cmd3, connection))
            {
                command.Parameters.Add("@UserID", SqlDbType.NVarChar, 128).Value = Request.Form[keys[0]];
                command.Parameters.Add("@FirstName", SqlDbType.NVarChar).Value = Request.Form[keys[1]];
                command.Parameters.Add("@LastName", SqlDbType.NVarChar, 128).Value = Request.Form[keys[2]];
                command.Parameters.Add("@Role", SqlDbType.NVarChar).Value = Request.Form[keys[3]];

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }
        }

        [Authorize(Roles = "Admin")]
        public async Task AssignStaffToAdmin()
        {
            string[] keys = Request.Form.AllKeys;

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "UPDATE [dbo].[AspNetUserRoles] SET RoleId = @RoleID WHERE UserId = @UserID;";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                command.Parameters.Add("@UserID", SqlDbType.NVarChar, 128).Value = Request.Form[keys[0]];
                command.Parameters.Add("@RoleID", SqlDbType.Int).Value = 3;

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }
        }

        [Authorize(Roles = "Admin")]
        public async Task UnassignStaffToAdmin()
        {
            string[] keys = Request.Form.AllKeys;

            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "UPDATE [dbo].[AspNetUserRoles] SET RoleId = @RoleID WHERE UserId = @UserID;";

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {
                command.Parameters.Add("@UserID", SqlDbType.NVarChar, 128).Value = Request.Form[keys[0]];
                command.Parameters.Add("@RoleID", SqlDbType.Int).Value = 2;

                connection.Open();

                command.ExecuteNonQuery();

                connection.Close();
            }
        }

        public async Task UpdateExerciseEmail()
        {
            string[] keys = Request.Form.AllKeys;

            List<AssignedExerciseViewModal> tableData = JsonConvert.DeserializeObject<List<AssignedExerciseViewModal>>(Request.Form[keys[0]]);
            string userID = Request.Form[keys[1]];

            UserEmailModal userEmail = await getEmailAddress(userID);

            string htmlTabel = ComposeUpdateTable(tableData, Request.Form[keys[2]]);

            await sendUpdateEmail(htmlTabel, userEmail.EmailAddress);
        }

        private async Task<UserEmailModal> getEmailAddress(string userID)
        {
            string conn = ConfigurationManager.ConnectionStrings["PhysioDatabaseConnection"].ConnectionString;

            SqlConnection connection = new SqlConnection(conn);

            string cmd = "SELECT Email FROM [dbo].[AspNetUsers] Where Id = '"+ userID +"';";

            UserEmailModal userEmail = new UserEmailModal();

            using (SqlCommand command = new SqlCommand(cmd, connection))
            {

                connection.Open();
                using (SqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        userEmail.EmailAddress = reader.GetString(0);
                    }
                }
                connection.Close();
            }

            return userEmail;
        }

        private string ComposeUpdateTable(List<AssignedExerciseViewModal> tableData, string name)
        {
            var table = new HtmlTable();
            var mailMessage = new StringBuilder();
            string html;

            string leadingText = "<p>Hi, " + name + ". There has been an update in your exerises. Look below or vist https://asclepiusdis.azurewebsites.net/ </p>";
            string htmlTableStart = "<table style=\"border-collapse:collapse; text-align:center;\" >";
            string htmlTableEnd = "</table>";
            string htmlHeaderRowStart = "<tr style =\"background-color:#6FA1D2; color:#ffffff;\">";
            string htmlHeaderRowEnd = "</tr>";
            string htmlTrStart = "<tr style =\"color:#555555;\">";
            string htmlTrEnd = "</tr>";
            string htmlTdStart = "<td style=\" border-color:#5c87b2; border-style:solid; border-width:thin; padding: 5px;\">";
            string htmlTdEnd = "</td>";

            mailMessage.AppendFormat(leadingText);

            mailMessage.AppendFormat(htmlTableStart);
            mailMessage.AppendFormat(htmlHeaderRowStart);
            mailMessage.AppendFormat(htmlTdStart + "Name " + htmlTdEnd);
            mailMessage.AppendFormat(htmlTdStart + "Description " + htmlTdEnd);
            mailMessage.AppendFormat(htmlTdStart + "Type " + htmlTdEnd);
            mailMessage.AppendFormat(htmlTdStart + "Sets " + htmlTdEnd);
            mailMessage.AppendFormat(htmlTdStart + "Repetitions " + htmlTdEnd);
            mailMessage.AppendFormat(htmlHeaderRowEnd);

            foreach (var tableRow in tableData)
            {
                mailMessage.AppendFormat(htmlTrStart);
                mailMessage.AppendFormat(htmlTdStart + tableRow.Name + htmlTdEnd);
                mailMessage.AppendFormat(htmlTdStart + tableRow.Description + htmlTdEnd);
                mailMessage.AppendFormat(htmlTdStart + tableRow.Type + htmlTdEnd);
                mailMessage.AppendFormat(htmlTdStart + tableRow.Sets.ToString() + htmlTdEnd);
                mailMessage.AppendFormat(htmlTdStart + tableRow.Repetitions.ToString() + htmlTdEnd);
                mailMessage.AppendFormat(htmlTrEnd);
            }

            mailMessage.AppendFormat(htmlTableEnd);

            using (var sw = new StringWriter())
            {
                table.RenderControl(new HtmlTextWriter(sw));
                html = sw.ToString();
            }

            mailMessage.AppendFormat(html);
            return mailMessage.ToString();
        }
        private async Task sendUpdateEmail(string tableData, string emailAddress)
        {
            var apiKey = WebConfigurationManager.AppSettings["sendGridKey"];
            var client = new SendGridClient(apiKey);
            var from = new EmailAddress("noReply@asclepius.com", "Asclepius");
            var subject = "Exercise Update";
            var to = new EmailAddress(emailAddress);
            var plainTextContent = tableData;
            var htmlContent = tableData;
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            var response = await client.SendEmailAsync(msg);
        }
    }
}