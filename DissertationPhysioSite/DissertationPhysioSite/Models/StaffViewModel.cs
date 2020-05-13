using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DissertationPhysioSite.Models
{
    public class StaffViewModel
    {
        public string Role_ID { get; set; }
        public int Staff_ID { get; set; }
        public string UserID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }  

        public string Role { get; set; }
    }
}