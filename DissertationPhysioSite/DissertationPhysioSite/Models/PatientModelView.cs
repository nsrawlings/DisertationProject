using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DissertationPhysioSite.Models
{
    public class PatientModelView
    {
        public string UserID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string StaffFirstName { get; set; }
        public string StaffLastName { get; set; }
    }
}