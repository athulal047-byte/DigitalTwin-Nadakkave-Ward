import { useState } from 'react';
import { api } from '../services/api';
import { FileText, Download, Calendar, Filter, FileSpreadsheet, FileBarChart } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [reportType, setReportType] = useState('grievances');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      let columns: string[] = [];
      let rows: any[][] = [];
      let title = '';

      if (reportType === 'grievances') {
        const res = await api.getGrievances();
        data = res.data || [];
        title = 'Grievance Report';
        columns = ['Ticket No', 'Date', 'Department', 'Subject', 'Status', 'Priority'];
        rows = data.map(g => [
          g.ticket_no,
          new Date(g.created_at).toLocaleDateString(),
          g.department,
          g.subject,
          g.status,
          g.priority
        ]);
      } else if (reportType === 'inspections') {
        data = await api.getInspections();
        title = 'Inspection Report';
        columns = ['Entity Type', 'Entity ID', 'Date', 'Type', 'Score', 'Status'];
        rows = data.map(i => [
          i.entity_type,
          i.entity_id,
          new Date(i.created_at).toLocaleDateString(),
          i.inspection_type,
          i.score ? i.score.toString() : 'N/A',
          i.status
        ]);
      } else if (reportType === 'work_orders') {
        data = await api.getWorkOrders();
        title = 'Work Orders Report';
        columns = ['WO Number', 'Date', 'Department', 'Title', 'Status'];
        rows = data.map(wo => [
          wo.wo_number,
          new Date(wo.created_at).toLocaleDateString(),
          wo.department,
          wo.title,
          wo.status
        ]);
      }

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Nadakkavu Municipality - ${title}`, 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      
      autoTable(doc, {
        startY: 40,
        head: [columns],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [56, 189, 248] }, // sky-400
        styles: { fontSize: 9 }
      });
      
      doc.save(`nadakkavu_${reportType}_report.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      if (reportType === 'grievances') data = (await api.getGrievances()).data || [];
      else if (reportType === 'inspections') data = await api.getInspections();
      else if (reportType === 'work_orders') data = await api.getWorkOrders();

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      XLSX.writeFile(workbook, `nadakkavu_${reportType}_report.xlsx`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-24 left-32 bottom-24 w-[1000px] glass-panel animate-panel-in flex flex-col pointer-events-auto shadow-2xl">
      <div className="h-20 flex items-center px-8 shrink-0 border-b border-[var(--glass-border)] bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
            <FileBarChart size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Report Generator</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Export system data to PDF or Excel formats</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center relative">
        {/* Background Graphic */}
        <FileText size={400} className="absolute text-white/5 pointer-events-none -z-10 -rotate-12" />

        <div className="w-full max-w-2xl bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-2">
                <Filter size={14} /> Report Type
              </label>
              <select 
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-sky-500/50 transition-all appearance-none"
              >
                <option value="grievances">Grievances & Complaints</option>
                <option value="inspections">Inspections</option>
                <option value="work_orders">Work Orders</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-2">
                <Calendar size={14} /> Date Range (Optional)
              </label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-sky-500/50 transition-all [color-scheme:dark]"
                />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-sky-500/50 transition-all [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-t border-white/5 pt-8">
            <button 
              onClick={handleExportPDF}
              disabled={loading}
              className="flex-1 py-4 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              {loading ? 'Generating...' : 'Export as PDF'}
            </button>
            <button 
              onClick={handleExportExcel}
              disabled={loading}
              className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
            >
              <FileSpreadsheet size={18} />
              {loading ? 'Generating...' : 'Export as Excel'}
            </button>
            <button 
              disabled={loading}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all border border-white/10 flex items-center justify-center gap-2"
              title="Download raw JSON"
            >
              <Download size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
