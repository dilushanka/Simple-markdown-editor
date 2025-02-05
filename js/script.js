    // Configure marked with breaks enabled
    marked.setOptions({
      gfm: true,
      breaks: true,
    });

    const markdownInput = document.getElementById('markdown-input');
    const preview = document.getElementById('preview');
    const linkModal = document.getElementById('link-modal');
    const linkUrlInput = document.getElementById('link-url');
    const linkTextInput = document.getElementById('link-text');
    const notification = document.getElementById('notification');

    // Load saved markdown from localStorage (if available)
    window.addEventListener('DOMContentLoaded', () => {
      const savedContent = localStorage.getItem('markdownContent');
      if (savedContent) {
        markdownInput.value = savedContent;
        preview.innerHTML = marked.parse(savedContent);
      }
    });

    // Update preview in real time and save content to localStorage
    markdownInput.addEventListener('input', () => {
      const content = markdownInput.value;
      preview.innerHTML = marked.parse(content);
      localStorage.setItem('markdownContent', content);
    });

    // Function to show a notification message for 2 seconds
    function showNotification(message) {
      notification.textContent = message;
      notification.classList.add('show');
      setTimeout(() => {
        notification.classList.remove('show');
      }, 2000);
    }

    // Header function: insert header markdown for H1 to H4
    function formatHeader(level) {
      const headerPrefix = '#'.repeat(level) + ' ';
      const start = markdownInput.selectionStart;
      const end = markdownInput.selectionEnd;
      const selectedText = markdownInput.value.substring(start, end);
      
      if (selectedText.trim().length === 0) {
        // No text selected: insert header prefix at beginning of current line
        const value = markdownInput.value;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const before = value.substring(0, lineStart);
        const after = value.substring(lineStart);
        markdownInput.value = before + headerPrefix + after;
        const newCursorPos = lineStart + headerPrefix.length;
        markdownInput.setSelectionRange(newCursorPos, newCursorPos);
      } else {
        // Prepend header prefix to selected text
        const newText = headerPrefix + selectedText;
        markdownInput.value = markdownInput.value.substring(0, start) + newText + markdownInput.value.substring(end);
        markdownInput.setSelectionRange(start + headerPrefix.length, start + headerPrefix.length + selectedText.length);
      }
      markdownInput.focus();
      preview.innerHTML = marked.parse(markdownInput.value);
      localStorage.setItem('markdownContent', markdownInput.value);
    }

    // Auto-increment for numbered and bullet lists when Enter is pressed.
    markdownInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const cursorPosition = this.selectionStart;
        const value = this.value;
        const lineStart = value.lastIndexOf('\n', cursorPosition - 1) + 1;
        const currentLine = value.substring(lineStart, cursorPosition);

        // Check for numbered list pattern (e.g., "1. ")
        const numberedMatch = currentLine.match(/^(\s*)(\d+)\.\s/);
        if (numberedMatch) {
          e.preventDefault();
          const markerText = numberedMatch[0];
          if (currentLine.trim() === markerText.trim()) {
            // Only the marker exists – break the list.
            const before = value.substring(0, cursorPosition);
            const after = value.substring(cursorPosition);
            const newText = "\n";
            this.value = before + newText + after;
            const newCursorPos = cursorPosition + newText.length;
            this.setSelectionRange(newCursorPos, newCursorPos);
            preview.innerHTML = marked.parse(this.value);
            localStorage.setItem('markdownContent', this.value);
            return;
          } else {
            const indentation = numberedMatch[1];
            const currentNumber = parseInt(numberedMatch[2], 10);
            const nextNumber = currentNumber + 1;
            const newText = "\n" + indentation + nextNumber + ". ";
            const before = value.substring(0, cursorPosition);
            const after = value.substring(cursorPosition);
            this.value = before + newText + after;
            const newCursorPos = cursorPosition + newText.length;
            this.setSelectionRange(newCursorPos, newCursorPos);
            preview.innerHTML = marked.parse(this.value);
            localStorage.setItem('markdownContent', this.value);
            return;
          }
        }

        // Check for bullet list pattern (e.g., "- ", "* ", or "+ ")
        const bulletMatch = currentLine.match(/^(\s*)([-*+])\s/);
        if (bulletMatch) {
          e.preventDefault();
          const markerText = bulletMatch[0];
          if (currentLine.trim() === markerText.trim()) {
            // Only the bullet marker exists – break the list.
            const before = value.substring(0, cursorPosition);
            const after = value.substring(cursorPosition);
            const newText = "\n";
            this.value = before + newText + after;
            const newCursorPos = cursorPosition + newText.length;
            this.setSelectionRange(newCursorPos, newCursorPos);
            preview.innerHTML = marked.parse(this.value);
            localStorage.setItem('markdownContent', this.value);
            return;
          } else {
            const indentation = bulletMatch[1];
            const bulletChar = bulletMatch[2];
            const newText = "\n" + indentation + bulletChar + " ";
            const before = value.substring(0, cursorPosition);
            const after = value.substring(cursorPosition);
            this.value = before + newText + after;
            const newCursorPos = cursorPosition + newText.length;
            this.setSelectionRange(newCursorPos, newCursorPos);
            preview.innerHTML = marked.parse(this.value);
            localStorage.setItem('markdownContent', this.value);
            return;
          }
        }
      }
    });

    // Enhanced list formatting function
    function formatList(listType) {
      const start = markdownInput.selectionStart;
      const end = markdownInput.selectionEnd;
      let selectedText = markdownInput.value.substring(start, end);
      if (!selectedText) {
        const initialItem = listType === 'bullet' ? '- ' : '1. ';
        markdownInput.value = markdownInput.value.substring(0, start) + initialItem + markdownInput.value.substring(end);
        markdownInput.focus();
        markdownInput.setSelectionRange(start + initialItem.length, start + initialItem.length);
        localStorage.setItem('markdownContent', markdownInput.value);
        return;
      }
      let formattedText = '';
      const lines = selectedText.split('\n');
      let listNumber = 1;
      let previousWasEmpty = false;
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        const isEmpty = trimmedLine === '';
        const indentation = line.match(/^\s*/)[0];
        if (!isEmpty) {
          if (listType === 'bullet') {
            formattedText += `${indentation}- ${line.replace(/^\s*/, '')}\n`;
          } else {
            formattedText += `${indentation}${previousWasEmpty ? 1 : listNumber}. ${line.replace(/^\s*/, '')}\n`;
            listNumber = previousWasEmpty ? 2 : listNumber + 1;
          }
          previousWasEmpty = false;
        } else {
          formattedText += '\n';
          previousWasEmpty = true;
          if (listType === 'number') listNumber = 1;
        }
      });
      markdownInput.value = markdownInput.value.substring(0, start) + formattedText + markdownInput.value.substring(end);
      markdownInput.focus();
      const newEnd = start + formattedText.length;
      markdownInput.setSelectionRange(start, newEnd);
      preview.innerHTML = marked.parse(markdownInput.value);
      localStorage.setItem('markdownContent', markdownInput.value);
    }

    // Text formatting function (for bold, italic, etc.)
    function formatText(prefix, suffix) {
      const start = markdownInput.selectionStart;
      const end = markdownInput.selectionEnd;
      const selectedText = markdownInput.value.substring(start, end);
      markdownInput.value = markdownInput.value.substring(0, start) + prefix + selectedText + suffix + markdownInput.value.substring(end);
      markdownInput.focus();
      markdownInput.setSelectionRange(start + prefix.length, end + prefix.length);
      preview.innerHTML = marked.parse(markdownInput.value);
      localStorage.setItem('markdownContent', markdownInput.value);
    }

    // Link modal functions
    function openLinkModal() {
      linkModal.style.display = 'flex';
    }
    function closeLinkModal() {
      linkModal.style.display = 'none';
      linkUrlInput.value = '';
      linkTextInput.value = '';
    }
    function insertLink() {
      const url = linkUrlInput.value;
      const text = linkTextInput.value;
      if (url && text) {
        formatText(`[${text}](${url})`, '');
        closeLinkModal();
      } else {
        alert('Please enter both URL and link text.');
      }
    }

    // Copy functions with notification
    async function copyMarkdown() {
      try {
        await navigator.clipboard.writeText(markdownInput.value);
        showNotification("Text copied to clipboard!");
      } catch (err) {
        alert('Failed to copy Markdown');
      }
    }
    async function copyPreview() {
      try {
        await navigator.clipboard.writeText(preview.innerHTML);
        showNotification("Text copied to clipboard!");
      } catch (err) {
        alert('Failed to copy HTML');
      }
    }

    // Clear content function with notification (no confirmation) and clear localStorage
    function clearContent() {
      markdownInput.value = '';
      preview.innerHTML = '';
      markdownInput.focus();
      localStorage.removeItem('markdownContent');
      showNotification("Content deleted!");
    }
  