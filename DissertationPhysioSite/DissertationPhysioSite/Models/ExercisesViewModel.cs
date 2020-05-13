using Microsoft.Ajax.Utilities;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Web;

namespace DissertationPhysioSite.Models
{
    public class ExercisesViewModel
    {
        public int Exercises_ID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Exercise_Group { get; set; }
        public string Image { get; set; }
        public string ImageName { get; set; }
        public string ImageType { get; set; }
    }
}