using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TheDrawingApp.Models;

namespace TheDrawingApp.Hubs
{
    public class DrawingHub : Hub
    {
        public void UpdateDrawing(DrawingSegment drawingSegment)
        {
            Clients.Others.drawSegment(drawingSegment);
        }

        public void ClearDrawing()
        {
            Clients.All.clearCanvas();
        }
    }
}