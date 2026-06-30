// Utility function to get proper chat image with fallback
export const getChatImage = (user) => {
  if (user?.image) {
    return user.image;
  }
  
  // Fallback to a default avatar if no image
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/path%3E%3C/svg%3E";
};
