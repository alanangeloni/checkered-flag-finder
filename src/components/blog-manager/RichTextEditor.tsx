import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Heading2, Heading3, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUploadRequest?: () => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, onImageUploadRequest }) => {
  const [editorRef, setEditorRef] = useState<HTMLDivElement | null>(null);
  const [html, setHtml] = useState('');

  // Convert markdown to HTML for display
  useEffect(() => {
    // This is a simple conversion - in a real app you'd use a proper markdown parser
    let htmlContent = value
      .replace(/# (.*?)(?:\n|$)/g, '<h1>$1</h1>')
      .replace(/## (.*?)(?:\n|$)/g, '<h2>$1</h2>')
      .replace(/### (.*?)(?:\n|$)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    
    // Handle image placeholders
    htmlContent = htmlContent.replace(/!\[(.*?)\]\(image:(.*?)\)/g, 
      '<div class="image-placeholder" data-id="$2"><span>$1</span></div>');
    
    setHtml(htmlContent);
  }, [value]);

  // Handle formatting commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    
    if (editorRef) {
      // After command execution, update the markdown value
      const newHtml = editorRef.innerHTML;
      
      // Convert HTML back to markdown (simplified)
      let markdown = newHtml
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<br>/g, '\n');
      
      // Remove other HTML tags but keep their content
      markdown = markdown.replace(/<(?!img|\/img)[^>]+>/g, '');
      
      onChange(markdown);
    }
  };

  // Format commands
  const formatBold = () => execCommand('bold');
  const formatItalic = () => execCommand('italic');
  const formatH2 = () => execCommand('formatBlock', '<h2>');
  const formatH3 = () => execCommand('formatBlock', '<h3>');
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) execCommand('createLink', url);
  };
  const alignLeft = () => execCommand('justifyLeft');
  const alignCenter = () => execCommand('justifyCenter');
  const alignRight = () => execCommand('justifyRight');
  const insertUnorderedList = () => execCommand('insertUnorderedList');
  const insertOrderedList = () => execCommand('insertOrderedList');

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted p-2 flex flex-wrap gap-1 border-b">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatH2}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatH3}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatBold}
          title="Bold"
        >
          <Bold size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatItalic}
          title="Italic"
        >
          <Italic size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          title="Insert Link"
        >
          <LinkIcon size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onImageUploadRequest}
          title="Insert Image"
        >
          <ImageIcon size={16} />
        </Button>
        <div className="h-6 w-px bg-border mx-1"></div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={alignLeft}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={alignCenter}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={alignRight}
          title="Align Right"
        >
          <AlignRight size={16} />
        </Button>
        <div className="h-6 w-px bg-border mx-1"></div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertUnorderedList}
          title="Bullet List"
        >
          <List size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertOrderedList}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </Button>
      </div>
      
      <div
        ref={setEditorRef}
        className="min-h-[300px] p-3 focus:outline-none"
        contentEditable
        dangerouslySetInnerHTML={{ __html: html }}
        onInput={(e) => {
          const target = e.target as HTMLDivElement;
          // Convert HTML back to markdown (simplified)
          let markdown = target.innerHTML
            .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
            .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
            .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<br>/g, '\n');
          
          // Remove other HTML tags but keep their content
          markdown = markdown.replace(/<(?!img|\/img)[^>]+>/g, '');
          
          onChange(markdown);
        }}
      />
      
      <div className="bg-muted p-2 border-t text-xs text-muted-foreground">
        Rich text editor - formatting will be saved as markdown
      </div>
    </div>
  );
};

export default RichTextEditor;
