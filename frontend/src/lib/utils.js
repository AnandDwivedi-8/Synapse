import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const readFileAsDataURL = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
    }
    reader.readAsDataURL(file);
  })
}

export const formatMessageTime = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  const now = new Date();
  
  // Get times at midnight for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
  
  const diffTime = today - messageDay;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  // Today: Show time only with seconds (e.g., "2:30:45 PM")
  if (diffDays === 0) {
    return messageDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  }
  
  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday ' + messageDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // Within a week: Show day name with time (e.g., "Monday 2:30 PM")
  if (diffDays < 7) {
    return messageDate.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + 
           messageDate.toLocaleTimeString('en-US', { 
             hour: 'numeric', 
             minute: '2-digit',
             hour12: true 
           });
  }
  
  // Older: Show full date and time (e.g., "12/25 2:30 PM")
  return messageDate.toLocaleDateString('en-US', { 
    month: 'numeric', 
    day: 'numeric',
    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  }) + ' ' + 
  messageDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}
