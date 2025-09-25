import { useState, useEffect, useMemo, useCallback } from 'react';
import Service, { type ServiceType } from '../services/Service';
import createService from '../services/createService';
import { Box, Chip, Typography } from '@mui/material';

interface TagFilterProps {
  serviceType: ServiceType;
  onTagsChange: (tags: string[]) => void;
  initialSelectedTags?: string[];
}

const TagFilter: React.FC<TagFilterProps> = ({ 
  onTagsChange,
  serviceType,
  initialSelectedTags = []
}) => {
  const service: Service = useMemo(() => createService(serviceType), [serviceType]);

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);
  
  const fetchAvailableTags = useCallback(async (): Promise<void> => {
    try {
      const tags = await service.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, [service]);

  // Handle tag selection
  const handleTagClick = (tag: string): void => {
    setSelectedTags(prevTags => {
      const isSelected = prevTags.includes(tag);
      const newTags = isSelected
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag];
      
      return newTags;
    });
  };
  
  useEffect(() => {
    onTagsChange(selectedTags);
  }, [selectedTags, onTagsChange]);

  useEffect(() => {
    void fetchAvailableTags();
  }, [fetchAvailableTags]);

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <Box sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 1,
      justifyContent: 'flex-end',
      maxWidth: { xs: '100%', sm: '70%' }
    }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ alignSelf: 'center', mr: 1 }}
      >
        Filter by:
      </Typography>

      {availableTags.map(tag => (
        <Chip
          key={tag}
          label={tag}
          size="small"
          color={selectedTags.includes(tag) ? 'primary' : 'default'}
          onClick={() => handleTagClick(tag)}
          sx={{
            '&:hover': {
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        />
      ))}
    </Box>
  );
};

export default TagFilter;
