import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Loader2, AlertCircle, XCircle } from 'lucide-react'; // Import new icons

const API_BASE_URL = 'http://localhost:5000/api';

const OnlyOfficeEditorPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [editorConfig, setEditorConfig] = useState<any>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [errorConfig, setErrorConfig] = useState<string | null>(null);
  const [isScriptLoading, setIsScriptLoading] = useState(true);
  const [scriptError, setScriptError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEditorConfig = async () => {
      if (!documentId || !user?.id) {
        setErrorConfig('Document ID ou utilisateur non disponible.');
        setIsLoadingConfig(false);
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/onlyoffice/editor`, {
          documentId: documentId,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
        });
        setEditorConfig(response.data.config); // Access the 'config' property
        setIsLoadingConfig(false);
      } catch (err: any) {
        console.error('Failed to fetch OnlyOffice editor config:', err);
        setErrorConfig(err.response?.data?.message || 'Échec du chargement de la configuration de l\'éditeur.');
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

  useEffect(() => {
    if (editorConfig && !scriptError) {
      const onlyOfficeApiScriptUrl = editorConfig.apiScriptUrl || 'http://localhost:8000/web-apps/apps/api/documents/api.js';
      
      const script = document.createElement('script');
      script.src = onlyOfficeApiScriptUrl;
      script.async = true;
      script.onload = () => {
        setIsScriptLoading(false);
        if (window.DocsAPI) {
          console.log('OnlyOffice API loaded. Initializing editor...');
          try {
            const docEditor = new window.DocsAPI.DocEditor('onlyoffice-editor-container', editorConfig);
            console.log('OnlyOffice editor initialized:', docEditor);
          } catch (e: any) {
            console.error('Error initializing OnlyOffice editor:', e);
            setScriptError(`Erreur d'initialisation de l'éditeur: ${e.message || 'Vérifiez la console pour plus de détails.'}`);
            toast({
              title: 'Erreur OnlyOffice',
              description: 'L\'éditeur n\'a pas pu être initialisé. Vérifiez la configuration.',
              variant: 'destructive',
            });
          }
        } else {
          console.error('DocsAPI not found after script load.');
          setScriptError('L\'API OnlyOffice n\'a pas pu être chargée correctement. Vérifiez l\'URL du Document Server.');
          toast({
            title: 'Erreur OnlyOffice',
            description: 'L\'API OnlyOffice n\'a pas pu être chargée correctement.',
            variant: 'destructive',
          });
        }
      };
      script.onerror = (e) => {
        console.error('Failed to load OnlyOffice API script:', e);
        setIsScriptLoading(false);
        setScriptError('Impossible de charger le script de l\'API OnlyOffice. Vérifiez l\'URL du Document Server dans vos variables d\'environnement.');
        toast({
          title: 'Erreur OnlyOffice',
          description: 'Impossible de charger le script de l\'API OnlyOffice. Vérifiez l\'URL du Document Server.',
          variant: 'destructive',
        });
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
        // Clean up editor instance if necessary (DocsAPI.DocEditor.destroy() if a reference is kept)
      };
    }
  }, [editorConfig, scriptError, toast]);

  if (isLoadingConfig) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <Loader2 className="h-16 w-16 animate-spin text-aviation-sky" />
          <p className="ml-4 text-gray-600">Chargement de la configuration de l'éditeur...</p>
        </div>
      </AppLayout>
    );
  }

  if (errorConfig) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-red-600">
          <XCircle className="w-16 h-16 mb-4" />
          <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
          <p className="text-center">{errorConfig}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Retour</button>
        </div>
      </AppLayout>
    );
  }

  if (!editorConfig || !editorConfig.document || !editorConfig.document.url) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-orange-600">
          <AlertCircle className="w-16 h-16 mb-4" />
          <h2 className="text-xl font-bold mb-2">Configuration de l'éditeur incomplète</h2>
          <p className="text-center">Veuillez vérifier la configuration de votre serveur OnlyOffice Document Server et de votre backend.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Retour</button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full p-4">
        <h1 className="text-2xl font-bold mb-4">Édition du document : {editorConfig?.document?.title || 'Chargement...'}</h1>
        <div id="onlyoffice-editor-container" className="flex-1 border rounded-lg overflow-hidden" style={{ minHeight: '700px' }}>
          {isScriptLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-12 w-12 animate-spin text-aviation-sky" />
              <p className="ml-4 text-gray-600">Chargement du script OnlyOffice API...</p>
            </div>
          )}
          {scriptError && !isScriptLoading && (
            <div className="flex flex-col items-center justify-center h-full text-red-600">
              <XCircle className="w-12 h-12 mb-4" />
              <p className="text-center">{scriptError}</p>
              <p className="text-sm text-gray-500 mt-2">Assurez-vous que votre serveur OnlyOffice Document Server est en cours d'exécution et accessible.</p>
            </div>
          )}
          {/* The editor will be injected here by DocsAPI */}
          {!isScriptLoading && !scriptError && !window.DocsAPI && (
            <div className="text-center text-gray-500 py-10">
              Préparation de l'éditeur... Si l'éditeur ne s'affiche pas, vérifiez la console pour les erreurs.
            </div>
          )}
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