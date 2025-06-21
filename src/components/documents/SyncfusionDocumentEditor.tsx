import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { getAbsoluteFilePath } from '@/shared/utils';

// Importation des composants et styles Syncfusion
import { DocumentEditorContainerComponent, ToolbarItem, DocumentEditorComponent } from '@syncfusion/ej2-react-documenteditor';
import { Toolbar, SfdtExport, WordExport, TextExport, Selection, Editor, ImageResizer, Hyperlink, TableOfContents, PageLayouting, Table, Bookmark, Comments, TrackChanges, Search, FormFields, ContextMenu, TextProperties, ParagraphProperties, BordersAndShading, Styles, List, TableProperties, TableCellProperties, Break, Section, HeaderFooter, PageSetup, Equation, Footnotes, SpellingChecker, EditorHistory, OptionsPane, CollaborativeEditing } from '@syncfusion/ej2-documenteditor';

// Enregistrement des modules nécessaires pour l'éditeur
DocumentEditorContainerComponent.Inject(Toolbar, SfdtExport, WordExport, TextExport, Selection, Editor, ImageResizer, Hyperlink, TableOfContents, PageLayouting, Table, Bookmark, Comments, TrackChanges, Search, FormFields, ContextMenu, TextProperties, ParagraphProperties, BordersAndShading, Styles, List, TableProperties, TableCellProperties, Break, Section, HeaderFooter, PageSetup, Equation, Footnotes, SpellingChecker, EditorHistory, OptionsPane, CollaborativeEditing);

// Importation des styles CSS de Syncfusion (nécessaire pour le rendu)
// NOTE: L'intégration de CSS externes comme ceux-ci peut potentiellement entrer en conflit avec Tailwind CSS
// ou les styles shadcn/ui. C'est une conséquence de l'utilisation d'une bibliothèque UI complète.
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-richtexteditor/styles/material.css';
import '@syncfusion/ej2-documenteditor/styles/material.css';


export const SyncfusionDocumentEditor: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { documents, isLoading: isLoadingDocuments, updateDocument, isUpdating } = useDocuments();
  const { toast } = useToast();
  const documentEditorRef = useRef<DocumentEditorContainerComponent>(null);
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

    if (document && documentEditorRef.current) {
      const editor = documentEditorRef.current.documentEditor;
      if (editor) {
        // IMPORTANT: Pour charger un document réel (DOCX, PDF, etc.) dans Syncfusion,
        // vous avez besoin d'un service backend Syncfusion Document Editor Web API.
        // Ce service est responsable de la conversion du fichier en format SFDT (Syncfusion Document Text)
        // que l'éditeur peut comprendre.
        //
        // Pour la démonstration, nous allons simuler le chargement ou charger un document SFDT vide.
        // En production, vous feriez un appel à votre service backend Syncfusion ici.
        //
        // Exemple de chargement d'un document SFDT depuis une URL (nécessite un service backend) :
        // editor.open('URL_VERS_VOTRE_DOCUMENT_SFDT_OU_VOTRE_API_DE_CHARGEMENT', 'SFDT');
        //
        // Pour l'instant, nous allons juste marquer l'éditeur comme chargé.
        console.log('Syncfusion Document Editor est prêt à être utilisé.');
        setIsEditorLoading(false);

        // Si vous avez un chemin de fichier, vous pouvez tenter de le charger
        // via votre service backend Syncfusion.
        if (document.file_path) {
          // Ceci est un exemple conceptuel. L'URL réelle dépendra de votre service Syncfusion.
          // Par exemple: `http://localhost:8000/api/documenteditor/Load?fileName=${document.file_path}`
          // où `http://localhost:8000` est l'URL de votre service Syncfusion Document Editor.
          const documentLoadUrl = `http://localhost:8000/api/documenteditor/Load?fileName=${encodeURIComponent(document.file_path)}`;
          console.log(`Tentative de chargement du document depuis: ${documentLoadUrl}`);
          // editor.open(documentLoadUrl, 'SFDT'); // Décommenter si vous avez le service backend
        } else {
          console.log('Aucun fichier associé au document, chargement d\'un document vide.');
          editor.open('{"sections":[{"blocks":[{"inlines":[{"text":"Commencez à taper ici..."}]}]}]}');
        }
      }
    }

    // Pas de nettoyage spécifique pour l'instance d'éditeur comme OnlyOffice,
    // car Syncfusion gère son cycle de vie via le composant React.
  }, [document, documentId, isLoadingDocuments, navigate, toast]);

  const handleSave = () => {
    if (documentEditorRef.current && documentEditorRef.current.documentEditor) {
      setIsSaving(true);
      const editor = documentEditorRef.current.documentEditor;

      // IMPORTANT: Pour sauvegarder un document réel, vous avez besoin d'un service backend
      // Syncfusion Document Editor Web API. L'éditeur envoie le document au format SFDT
      // à ce service, qui le convertit ensuite dans le format souhaité (DOCX, PDF, etc.)
      // et le stocke.
      //
      // Exemple de sauvegarde (nécessite un service backend):
      // const sfdtContent = editor.serialize(); // Récupère le contenu au format SFDT
      // axios.post('URL_VERS_VOTRE_API_DE_SAUVEGARDE', { documentId: document.id, sfdt: sfdtContent })
      //   .then(response => {
      //     console.log('Document sauvegardé via Syncfusion backend:', response.data);
      //     toast({ title: "Document sauvegardé", description: "Le document a été sauvegardé avec succès." });
      //     setIsSaving(false);
      //     // Mettre à jour le document dans votre base de données si nécessaire (ex: version, chemin du fichier)
      //     updateDocument({ id: documentId!, version: (document?.version || 0) + 1 });
      //   })
      //   .catch(error => {
      //     console.error('Erreur de sauvegarde via Syncfusion backend:', error);
      //     toast({ title: "Erreur de sauvegarde", description: "Impossible de sauvegarder le document.", variant: "destructive" });
      //     setIsSaving(false);
      //   });

      // Pour la démonstration, nous allons simuler la sauvegarde.
      setTimeout(() => {
        setIsSaving(false);
        toast({
          title: "Sauvegarde simulée",
          description: "La sauvegarde du document a été initiée. Un service backend Syncfusion est nécessaire pour une sauvegarde réelle.",
          variant: "success"
        });
        // Simuler une mise à jour de version pour montrer que quelque chose s'est passé
        updateDocument({ id: documentId!, version: (document?.version || 0) + 1 });
      }, 1500);
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
          {/* Le composant DocumentEditorContainerComponent de Syncfusion */}
          <DocumentEditorContainerComponent
            id="container"
            ref={documentEditorRef}
            height={'100%'}
            width={'100%'}
            serviceUrl="http://localhost:8000/api/documenteditor/" // Remplacez par l'URL de votre service backend Syncfusion
            enableToolbar={true}
            enableSfdtExport={true}
            enableWordExport={true}
            enableTextExport={true}
            enablePrint={true}
            enableSelection={true}
            enableEditor={true}
            enableImageResizer={true}
            enableHyperlinkDialog={true}
            enableTableOfContentsDialog={true}
            enablePageLayouting={true}
            enableTable={true}
            enableBookmarkDialog={true}
            enableComments={true}
            enableTrackChanges={true}
            enableSearch={true}
            enableFormFields={true}
            enableContextMenu={true}
            enableTextProperties={true}
            enableParagraphProperties={true}
            enableBordersAndShadingDialog={true}
            enableStylesDialog={true}
            enableListDialog={true}
            enableTablePropertiesDialog={true}
            enableTableCellPropertiesDialog={true}
            enableBreak={true}
            enableSection={true}
            enableHeaderFooter={true}
            enablePageSetupDialog={true}
            enableEquationDialog={true}
            enableFootnotesAndEndnotesDialog={true}
            enableSpellingCheck={true}
            enableEditorHistory={true}
            enableOptionsPane={true}
            enableCollaborativeEditing={false} // Activez si vous configurez l'édition collaborative
            toolbarItems={[
              'New', 'Open', 'Separator', 'Undo', 'Redo', 'Separator',
              'Image', 'Table', 'Hyperlink', 'Bookmark', 'TableOfContents', 'Separator',
              'Header', 'Footer', 'PageSetup', 'PageBreak', 'SectionBreak', 'ColumnBreak', 'Separator',
              'Comments', 'TrackChanges', 'Separator',
              'Find', 'Replace', 'Separator',
              'Print', 'Separator',
              'SfdtExport', 'WordExport', 'TextExport', 'Separator',
              'FormFields', 'Separator',
              'Styles', 'List', 'Paragraph', 'TableProperties', 'TableCellProperties', 'BordersAndShading', 'Separator',
              'Equation', 'Footnotes', 'SpellingAndGrammar', 'Separator',
              'EditorHistory', 'OptionsPane'
            ]}
          >
          </DocumentEditorContainerComponent>
        </CardContent>
      </Card>
    </div>
  );
};