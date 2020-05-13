using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DissertationPhysioSite.Models
{
    public class AssignedExerciseViewModal
    {
        public int User_Exercise_ID { get; set; }
        public string User_ID { get; set; }
        public int Exercise_ID { get; set; }
        public int Sets { get; set; }
        public int Repetitions { get; set; }
        public int Exercises_ID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Exercise_Group { get; set; }
        public string ImageData { get; set; }
    }
}