import * as React from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileJson, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  X,
  AlertCircle,
  Table as TableIcon
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ImportType = "CSV" | "XLSX" | "JSON";

interface FieldDefinition {
  key: string;
  label: string;
  required?: boolean;
}

interface ImportWizardProps {
  open: boolean;
  onClose: () => void;
  entityType: "CONTACT" | "COMPANY";
  fields: FieldDefinition[];
  onImport: (data: any[]) => Promise<void>;
}

export function ImportWizard({ open, onClose, entityType, fields, onImport }: ImportWizardProps) {
  const [step, setStep] = useState(1);
  const [fileType, setFileType] = useState<ImportType | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const reset = () => {
    setStep(1);
    setFileType(null);
    setHeaders([]);
    setRawData([]);
    setMapping({});
    setIsProcessing(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileTypeSelect = (type: ImportType) => {
    setFileType(type);
    setStep(2);
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result) return;

      try {
        if (fileType === "JSON") {
          const json = JSON.parse(result as string);
          const data = Array.isArray(json) ? json : [json];
          setRawData(data);
          if (data.length > 0) {
            setHeaders(Object.keys(data[0]));
          }
        } else if (fileType === "CSV") {
          Papa.parse(result as string, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              setRawData(results.data);
              if (results.meta.fields) {
                setHeaders(results.meta.fields);
              }
            }
          });
        } else if (fileType === "XLSX") {
          const workbook = XLSX.read(result, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (json.length > 0) {
            const h = json[0] as string[];
            setHeaders(h);
            const data = (json as any[]).slice(1).map(row => {
              const obj: any = {};
              h.forEach((header, i) => {
                obj[header] = row[i];
              });
              return obj;
            });
            setRawData(data);
          }
        }
        setStep(3);
      } catch (err) {
        toast.error("Failed to parse file. Please check the format.");
      } finally {
        setIsProcessing(false);
      }
    };

    if (fileType === "XLSX") {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      processFile(f);
    }
  };

  const handleMappingChange = (fieldKey: string, headerName: string) => {
    setMapping(prev => ({ ...prev, [fieldKey]: headerName }));
  };

  const autoMap = () => {
    const newMapping: Record<string, string> = {};
    fields.forEach(f => {
      const match = headers.find(h => 
        h.toLowerCase().trim() === f.key.toLowerCase() || 
        h.toLowerCase().trim() === f.label.toLowerCase()
      );
      if (match) newMapping[f.key] = match;
    });
    setMapping(newMapping);
  };

  const handleFinish = async () => {
    setIsProcessing(true);
    try {
      const mappedData = rawData.map(row => {
        const item: any = {};
        Object.entries(mapping).forEach(([fieldKey, headerName]) => {
          if (headerName) {
            item[fieldKey] = row[headerName];
          }
        });
        return item;
      });
      await onImport(mappedData);
      toast.success("Import completed successfully");
      handleClose();
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { title: "Select Format", icon: <FileText className="w-4 h-4" /> },
    { title: "Upload", icon: <Upload className="w-4 h-4" /> },
    { title: "Map Fields", icon: <Check className="w-4 h-4" /> },
    { title: "Preview", icon: <TableIcon className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-card border border-border w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Import {entityType === "CONTACT" ? "Contacts" : "Companies"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Step {step} of 4: {steps[step-1].title}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-muted transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex w-full h-1 bg-muted">
          {[1, 2, 3, 4].map(s => (
            <div 
              key={s} 
              className={cn(
                "flex-1 transition-all duration-500",
                step >= s ? "bg-primary" : "bg-transparent"
              )} 
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {[
                  { id: "CSV" as ImportType, label: "CSV File", icon: <FileText className="w-12 h-12 text-blue-500" />, desc: "Comma separated values" },
                  { id: "XLSX" as ImportType, label: "Excel Spreadsheet", icon: <FileSpreadsheet className="w-12 h-12 text-green-500" />, desc: ".xlsx or .xls formats" },
                  { id: "JSON" as ImportType, label: "JSON Data", icon: <FileJson className="w-12 h-12 text-yellow-500" />, desc: "Standard JSON array" }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleFileTypeSelect(type.id)}
                    className="flex flex-col items-center p-8 bg-muted/20 border border-border hover:border-primary hover:bg-primary/5 transition-all text-center group"
                  >
                    <div className="mb-4 transform group-hover:scale-110 transition-transform">
                      {type.icon}
                    </div>
                    <span className="text-lg font-bold mb-1">{type.label}</span>
                    <span className="text-sm text-muted-foreground">{type.desc}</span>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border hover:border-primary transition-colors bg-muted/5 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Click to upload or drag and drop</h3>
                <p className="text-sm text-muted-foreground">Supported format: {fileType}</p>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                  accept={fileType === "CSV" ? ".csv" : fileType === "JSON" ? ".json" : ".xlsx,.xls"}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Map File Columns to Fields</h3>
                  <button 
                    onClick={autoMap}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    Auto-map matching fields
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {fields.map(field => (
                    <div key={field.key} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-muted/30 border border-border">
                      <div className="md:w-1/3">
                        <span className="text-sm font-bold block">
                          {field.label} {field.required && <span className="text-destructive">*</span>}
                        </span>
                        <span className="text-xs text-muted-foreground">System field</span>
                      </div>
                      <ChevronRight className="hidden md:block w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <select
                          className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          value={mapping[field.key] || ""}
                          onChange={(e) => handleMappingChange(field.key, e.target.value)}
                        >
                          <option value="">Select column...</option>
                          {headers.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Preview (First 5 rows)</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    Total {rawData.length} rows detected
                  </div>
                </div>

                <div className="border border-border overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        {fields.filter(f => mapping[f.key]).map(f => (
                          <th key={f.key} className="px-4 py-3 font-bold">{f.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/10">
                          {fields.filter(f => mapping[f.key]).map(f => (
                            <td key={f.key} className="px-4 py-3">{row[mapping[f.key]] || "—"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-primary/5 p-4 border border-primary/20 flex gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                  <p>
                    Everything looks good! Click <strong>Finish Import</strong> to process <strong>{rawData.length}</strong> records. 
                    Required fields check result: {
                      fields.filter(f => f.required && !mapping[f.key]).length > 0 
                      ? <span className="text-destructive font-bold">Missing required field mappings!</span>
                      : <span className="text-success font-bold">All set.</span>
                    }
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between bg-muted/10">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? "Cancel" : "Back"}
          </button>
          
          <div className="flex items-center gap-3">
            {step < 4 ? (
              <button
                disabled={step === 1 || (step === 3 && fields.filter(f => f.required && !mapping[f.key]).length > 0)}
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={isProcessing || fields.filter(f => f.required && !mapping[f.key]).length > 0}
                onClick={handleFinish}
                className="flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isProcessing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Upload className="w-4 h-4" /></motion.div> : <Check className="w-4 h-4" />}
                Finish Import
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
