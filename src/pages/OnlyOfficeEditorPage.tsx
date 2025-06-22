import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';

const API_BASE_URL = 'http://localhost:5000/api';

const OnlyOfficeEditorPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [editorConfig, setEditorConfig] = useState<any>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [errorConfig, setErrorConfig] = useState<string | null>(null);

  useEffect(() => {
    const fetchEditorConfig = async () => {
      if (!documentId || !user?.id) {
        setErrorConfig('Document ID or user not available.');
        setIsLoadingConfig(false);
        return;
      }

      try {
        // Request editor configuration from your backend
        const response = await axios.post(`${API_BASE_URL}/onlyoffice/editor`, {
          documentId: documentId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
        });
        setEditorConfig(response.data);
        setIsLoadingConfig(false);
      } catch (err: any) {
        console.error('Failed to fetch OnlyOffice editor config:', err);
        setErrorConfig(err.response?.data?.message || 'Failed to load editor configuration.');
        setIsLoadingConfig(false);
        toast({
          title: 'Erreur de chargement de l\'éditeur',
          description: err.response?.data?.message || 'Impossible de charger la configuration de l\'éditeur OnlyOffice.',
          variant: 'destructive',
        });
      }
    };

    fetchEditorConfig();
  }, [documentId, user, toast]);

  if (isLoadingConfig) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-aviation-sky"></div>
          <p className="ml-4 text-gray-600">Chargement de l'éditeur OnlyOffice...</p>
        </div>
      </AppLayout>
    );
  }

  if (errorConfig) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-red-600">
          <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
          <p>{errorConfig}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Retour</button>
        </div>
      </AppLayout>
    );
  }

  if (!editorConfig || !editorConfig.editorUrl || !editorConfig.document || !editorConfig.document.url) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-orange-600">
          <h2 className="text-xl font-bold mb-2">Configuration de l'éditeur incomplète</h2>
          <p>Veuillez vérifier la configuration de votre serveur OnlyOffice Document Server et de votre backend.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Retour</button>
        </div>
      </AppLayout>
    );
  }

  // OnlyOffice editor expects a global DocsAPI object to be available.
  // This is typically loaded via a script tag from the Document Server.
  // For a React app, you might need to dynamically load it or ensure it's in index.html.
  // For simplicity, we'll assume it's loaded or the iframe handles it.
  // The iframe src will be the Document Server's editor URL with parameters.

  // Construct the URL for the OnlyOffice editor iframe
  // This is a simplified example. A real integration might involve more parameters
  // and a more robust way to pass the config to the iframe.
  // OnlyOffice typically uses a POST request to open the editor, or a complex URL.
  // For this example, we'll simulate a direct URL for the iframe.
  // In a full integration, you'd likely render a form and submit it to the Document Server.

  // A more robust way would be to have the backend render a full HTML page with the editor
  // configuration and redirect to it, or use a library like 'onlyoffice-document-editor-react'.
  // For this direct iframe approach, we'll pass minimal info.

  // The standard way to embed OnlyOffice is to load their API script and then
  // create a new DocsAPI.DocEditor object. This cannot be done directly in an iframe src.
  // The backend's /editor endpoint should ideally return a full HTML page that
  // initializes the editor, or the frontend needs to dynamically load the API script
  // and then initialize the editor.

  // Given the current backend placeholder, we'll adjust the frontend to expect
  // a direct URL to the OnlyOffice Document Server's editor page, passing document info.
  // This is a simplification and might not work without a proper Document Server setup.

  // For a proper integration, the backend's /onlyoffice/editor endpoint should return
  // a JSON object containing all parameters for the DocsAPI.DocEditor constructor.
  // Then, the frontend would dynamically load the OnlyOffice API script and initialize the editor.

  // Let's assume the backend's /onlyoffice/editor endpoint returns a 'config' object
  // that can be directly used by the DocsAPI.DocEditor.
  // We'll need to dynamically load the OnlyOffice API script.

  const onlyOfficeApiScriptUrl = editorConfig.apiScriptUrl || 'http://localhost:8000/web-apps/apps/api/documents/api.js'; // Default OnlyOffice API script URL

  useEffect(() => {
    if (editorConfig) {
      const script = document.createElement('script');
      script.src = onlyOfficeApiScriptUrl;
      script.async = true;
      script.onload = () => {
        if (window.DocsAPI) {
          console.log('OnlyOffice API loaded. Initializing editor...');
          const docEditor = new window.DocsAPI.DocEditor('onlyoffice-editor-container', editorConfig.config);
          console.log('OnlyOffice editor initialized:', docEditor);
        } else {
          console.error('DocsAPI not found after script load.');
          toast({
            title: 'Erreur OnlyOffice',
            description: 'L\'API OnlyOffice n\'a pas pu être chargée correctement.',
            variant: 'destructive',
          });
        }
      };
      script.onerror = (e) => {
        console.error('Failed to load OnlyOffice API script:', e);
        toast({
          title: 'Erreur OnlyOffice',
          description: 'Impossible de charger le script de l\'API OnlyOffice. Vérifiez l\'URL du Document Server.',
          variant: 'destructive',
        });
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
        // Clean up editor instance if necessary
        if (window.DocsAPI && window.DocsAPI.DocEditor) {
          // Assuming there's a way to destroy the editor instance
          // docEditor.destroy(); // This would be needed if we kept a reference
        }
      };
    }
  }, [editorConfig, onlyOfficeApiScriptUrl, toast]);

  return (
    <AppLayout>
      <div className="flex flex-col h-full p-4">
        <h1 className="text-2xl font-bold mb-4">Édition du document : {editorConfig?.document?.title || 'Chargement...'}</h1>
        <div id="onlyoffice-editor-container" className="flex-1 border rounded-lg overflow-hidden" style={{ minHeight: '700px' }}>
          {/* The editor will be injected here by DocsAPI */}
          <p className="text-center text-gray-500 py-10">Préparation de l'éditeur...</p>
        </div>
      </div>
    </AppLayout>
  );
};

// Extend Window interface to include DocsAPI
declare global {
  interface Window {
    DocsAPI?: {
      DocEditor: new (elementId: string, config: any) => any;
      // Add other DocsAPI properties/methods if needed
    };
  }
}

export default OnlyOfficeEditorPage;