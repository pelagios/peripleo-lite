import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BiTrash } from 'react-icons/bi';
import { listTags } from '../../store/StoreUtils';

import './FilterPanel.scss';

const FilterPanel = props => {

  const [ value, setValue ] = useState('');

  const [ showSuggestions, setShowSuggestions ] = useState(true);

  const [ suggestions, setSuggestions ] = useState([]);

  const [ suggestionIdx, setSuggestionIdx ] = useState(-1);

  const tags = listTags(props.store);

  const onKeyDown = evt => {
    if (evt.which === 9) {
      // Tab 
      evt.preventDefault();
      evt.stopPropagation(); 

      setValue(suggestions[suggestionIdx]);

      const idx = (suggestionIdx + 1) % suggestions.length;
      setSuggestionIdx(idx);
      setShowSuggestions(false);
    } else if (evt.which === 13) {
      // Enter
      props.onSetFilter(value);
    }
  }

  const onChange = evt => {
    const { value } = evt.target;

    const suggestions = tags.filter(t => t.toLowerCase().startsWith(value.toLowerCase()));

    setShowSuggestions(true);
    setSuggestions(suggestions);
    setSuggestionIdx(0);

    setValue(evt.target.value);
  }

  const onDelete = () => {
    props.onClearFilter();
    props.onDelete();
  }

  return (
    <motion.div className="p6o-stackpanel filters">
      <header>
        <h4>Tag Filters</h4>
        <button onClick={onDelete}>
          <BiTrash />
        </button>
      </header>
      <p>
        <input
          value={value} 
          onKeyDown={onKeyDown}
          onChange={onChange} />

        { suggestions.length > 0 && showSuggestions && 
          <span className="suggestion">
            {suggestions[suggestionIdx]}
          </span> 
        }
      </p>
    </motion.div>
  )

}

export default FilterPanel;