import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { getAbsoluteFilePath } from '@/shared/utils';

// Declare DocumentEditor global variable if it's loaded via script
declare global {
  interface Window {
    DocsAPI: any;
  }
}

export const DocumentEditor: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { documents, isLoading: isLoadingDocuments, updateDocument, isUpdating } = useDocuments();
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const document = documents.find(doc => doc.id === documentId);

  useEffect(() => {
    if (!documentId) {
      toast({
        title: "Erreur",
        description: "ID du document manquant.",
        variant: "destructive"
      });
      navigate('/documents');
      return;
    }

    if (!document && !isLoadingDocuments) {
      toast({
        title: "Document introuvable",
        description: "Le document spécifié n'existe pas.",
        variant: "destructive"
      });
      navigate('/documents');
      return;
    }

    if (document && editorRef.current && !editorInstance) {
      // OnlyOffice Document Server URL (replace with your actual server URL)
      // For local development, you might use a Docker container:
      // docker run -i -t -d -p 80:80 --restart=always onlyoffice/documentserver
      const ONLYOFFICE_DOC_SERVER_URL = 'http://localhost:80'; // Replace with your OnlyOffice Document Server URL

      // Mock backend endpoint for document configuration and save callback
      const BACKEND_API_URL = 'http://localhost:5000/api';

      const docConfig = {
        document: {
          fileType: document.file_type?.split('/').pop() || 'docx', // Ensure correct file type
          key: document.id, // Unique document identifier
          title: document.title,
          url: getAbsoluteFilePath(document.file_path || ''), // URL to the document file
          permissions: {
            edit: true, // Allow editing
            download: true,
            print: true,
          },
        },
        documentType: 'word', // 'word', 'cell', 'slide'
        editorConfig: {
          callbackUrl: `${BACKEND_API_URL}/onlyoffice/save-callback?documentId=${document.id}`, // Backend endpoint for saving
          lang: 'fr',
          mode: 'edit', // 'edit' or 'view'
          user: {
            id: document.author_id,
            name: `${document.author?.first_name} ${document.author?.last_name}`,
          },
          customization: {
            autosave: true,
            forcesave: false, // We'll handle manual save
            goback: {
              url: window.location.origin + '/documents', // URL to return to
            },
          },
        },
        height: '100%',
        width: '100%',
      };

      console.log('Initializing OnlyOffice Editor with config:', docConfig);

      // Load OnlyOffice API script dynamically if not already loaded
      if (!window.DocsAPI) {
        const script = document.createElement('script');
        script.src = `${ONLYOFFICE_DOC_SERVER_URL}/web-apps/apps/api/documents/api.js`;
        script.async = true;
        script.onload = () => {
          console.log('OnlyOffice API script loaded.');
          try {
            const editor = new window.DocsAPI.DocEditor(editorRef.current, docConfig);
            setEditorInstance(editor);
            editor.attachEvent(window.DocsAPI.DocEditor.event_onDocumentReady, () => {
              console.log('Document ready in OnlyOffice Editor.');
              setIsEditorLoading(false);
            });
            editor.attachEvent(window.DocsAPI.DocEditor.event_onWarning, (error: any) => {
              console.warn('OnlyOffice Warning:', error);
              toast({
                title: "Avertissement OnlyOffice",
                description: error.data,
                variant: "warning"
              });
            });
            editor.attachEvent(window.DocsAPI.DocEditor.event_onError, (error: any) => {
              console.error('OnlyOffice Error:', error);
              toast({
                title: "Erreur OnlyOffice",
                description: error.data,
                variant: "destructive"
              });
              setIsEditorLoading(false);
            });
          } catch (e) {
            console.error('Failed to create DocEditor instance:', e);
            toast({
              title: "Erreur d'initialisation de l'éditeur",
              description: "Impossible de charger l'éditeur de documents. Vérifiez la console pour plus de détails.",
              variant: "destructive"
            });
            setIsEditorLoading(false);
          }
        };
        script.onerror = (e) => {
          console.error('Failed to load OnlyOffice API script:', e);
          toast({
            title: "Erreur de chargement de l'éditeur",
            description: "Impossible de charger le script OnlyOffice. Assurez-vous que le serveur OnlyOffice est en cours d'exécution et accessible.",
            variant: "destructive"
          });
          setIsEditorLoading(false);
        };
        document.head.appendChild(script);
      } else {
        // If script is already loaded, just create the editor
        try {
          const editor = new window.DocsAPI.DocEditor(editorRef.current, docConfig);
          setEditorInstance(editor);
          editor.attachEvent(window.DocsAPI.DocEditor.event_onDocumentReady, () => {
            console.log('Document ready in OnlyOffice Editor (script already loaded).');
            setIsEditorLoading(false);
          });
          editor.attachEvent(window.DocsAPI.DocEditor.event_onWarning, (error: any) => {
            console.warn('OnlyOffice Warning:', error);
            toast({
              title: "Avertissement OnlyOffice",
              description: error.data,
              variant: "warning"
            });
          });
          editor.attachEvent(window.DocsAPI.DocEditor.event_onError, (error: any) => {
            console.error('OnlyOffice Error:', error);
            toast({
              title: "Erreur OnlyOffice",
              description: error.data,
              variant: "destructive"
            });
            setIsEditorLoading(false);
          });
        } catch (e) {
          console.error('Failed to create DocEditor instance (script already loaded):', e);
          toast({
            title: "Erreur d'initialisation de l'éditeur",
            description: "Impossible de charger l'éditeur de documents. Vérifiez la console pour plus de détails.",
            variant: "destructive"
          });
          setIsEditorLoading(false);
        }
      }
    }

    // Cleanup function
    return () => {
      if (editorInstance) {
        console.log('Destroying OnlyOffice Editor instance.');
        editorInstance.destroyEditor();
        setEditorInstance(null);
      }
    };
  }, [document, documentId, isLoadingDocuments, editorInstance, navigate, toast]);

  const handleSave = () => {
    if (editorInstance) {
      setIsSaving(true);
      console.log('Requesting OnlyOffice to force save.');
      editorInstance.forceSave(); // This will trigger the callbackUrl on the backend
      // In a real scenario, the backend would send a success/failure response
      // and then you'd update the frontend state accordingly.
      // For now, we'll simulate success after a delay.
      setTimeout(() => {
        setIsSaving(false);
        toast({
          title: "Sauvegarde initiée",
          description: "La sauvegarde du document a été demandée à l'éditeur. Le backend traitera la mise à jour.",
          variant: "success"
        });
        // You might want to refresh document data here if the backend confirms save
        // updateDocument({ id: documentId!, updated_at: new Date().toISOString() });
      }, 1000);
    }
  };

  if (isLoadingDocuments || !document) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-aviation-sky" />
        <p className="ml-4 text-lg text-gray-700">Chargement du document...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => navigate('/documents')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux documents
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
        <Button
          className="bg-aviation-sky hover:bg-aviation-sky-dark"
          onClick={handleSave}
          disabled={isEditorLoading || isSaving || isUpdating}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          {isEditorLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <Loader2 className="w-12 h-12 animate-spin text-aviation-sky" />
              <p className="ml-4 text-lg text-gray-700">Chargement de l'éditeur...</p>
            </div>
          )}
          <div ref={editorRef} className="w-full h-full">
            {/* OnlyOffice editor will be rendered here */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};