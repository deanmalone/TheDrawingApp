using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TheDrawingApp.Models
{
    public class DrawingSegment
    {
        public DrawingPoint start { get; set; }
        public List<DrawingPoint> points { get; set; }
        public string color { get; set; }
        public int size { get; set; }
    }
}