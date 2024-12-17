import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { InputLabel } from '@mui/material';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  label?: string;
  height?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label = '',
  height = 400,
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <InputLabel
          sx={{
            display: 'flex',
            position: 'relative',
            paddingBottom: 1,
            paddingLeft: 1,
          }}
        >
          {label}
        </InputLabel>
      )}
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height,
          menubar: false,
          paste_data_images: true,
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'help',
            'wordcount',
            'paste',
          ],
          toolbar:
            'undo redo | formatselect | bold italic | bullist numlist | link image media',
          file_picker_types: 'image media',
          automatic_uploads: true,
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          media_live_embeds: true,
        }}
      />
    </div>
  );
};

export default RichTextEditor;
