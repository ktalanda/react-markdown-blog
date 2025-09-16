function parseFolderName(folderName: string): { date: Date; } | null {
    // Validate folderName: must be 6 digits
    if (!/^\d{6}$/.test(folderName)) return null;
    const dateStr = folderName;
    const year = 2000 + parseInt(dateStr.substring(0, 2));
    const month = parseInt(dateStr.substring(2, 4)) - 1; // Month is 0-based
    const day = parseInt(dateStr.substring(4, 6));
    const date = new Date(year, month, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
    ) {
        return null;
    }
    return { date };
}

export default parseFolderName;
