using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DissertationPhysioSite.Models
{
    public class PatientExeriseModel
    {
        public string PatientID { get; set; }
        public List<AssignedExerciseViewModal> PatientExercise { get; set; }
    }
}