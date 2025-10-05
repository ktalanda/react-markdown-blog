import { useState, useEffect, useMemo, useCallback } from 'react';
import Service, { type ServiceType } from '../services/Service';
import createService from '../services/createService';
import { Box, Chip } from '@mui/material';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  serviceType: ServiceType;
}

const TagFilter: React.FC<TagFilterProps> = ({ 
  selectedTags,
  onTagsChange,
  serviceType
}) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const service: Service = useMemo(() => createService(serviceType), [serviceType]);

  const fetchAvailableTags = useCallback(async (): Promise<void> => {
    try {
      const tags = await service.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, [service]);

  const handleTagClick = (tag: string): void => {
    const isSelected = selectedTags.includes(tag);
    const newTags = isSelected
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    onTagsChange(newTags);
  };

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
