import React, { useState, useRef, useEffect } from 'react';
import { Smile, Search, Clock } from 'lucide-react';
import './css/EmojiPicker.css';

const EMOJI_CATEGORIES = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
    'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋'],
    'People': ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱', '👩‍🦰', '🧑‍🦰', '👨‍🦰', '👱‍♀️', '👱', '👱‍♂️', '👩‍🦳', '🧑‍🦳', '👨‍🦳', '👩‍🦲', '🧑‍🦲', '👨‍🦲', '🧔‍♀️', '🧔', '🧔‍♂️', '👵', '🧓', '👴', '👲', '👳‍♀️', '👳', '👳‍♂️', '🧕', '👮‍♀️', '👮', '👮‍♂️', '👷‍♀️', '👷', '👷‍♂️', '💂‍♀️', '💂', '💂‍♂️'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
    'Food': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢', '🧂'],
    'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🤹‍♂️', '🤹‍♀️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'],
    'Travel': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋'],
    'Objects': ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🖼️', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓']
};

const EmojiPicker = ({ onSelect, onClose, buttonClassName, onEmojiSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Smileys');
    const [searchQuery, setSearchQuery] = useState('');
    const [recentEmojis, setRecentEmojis] = useState(() => {
        const saved = localStorage.getItem('recentEmojis');
        return saved ? JSON.parse(saved) : [];
    });
    const pickerRef = useRef(null);
    const searchInputRef = useRef(null);

    // If buttonClassName is provided, we're in standalone mode with internal toggle
    const isStandaloneMode = !!buttonClassName;

    useEffect(() => {
        if (!isOpen && !isStandaloneMode) return; // Only add listener when open or in standalone mode

        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                if (isStandaloneMode) {
                    setIsOpen(false);
                } else {
                    onClose?.();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, isStandaloneMode, onClose]);

    // Focus search when picker opens
    useEffect(() => {
        if ((isStandaloneMode && isOpen) || (!isStandaloneMode)) {
            searchInputRef.current?.focus();
        }
    }, [isOpen, isStandaloneMode]);

    // Close picker on scroll
    useEffect(() => {
        if (!isOpen && isStandaloneMode) return;

        const handleScroll = () => {
            if (isStandaloneMode) {
                setIsOpen(false);
            } else {
                onClose?.();
            }
        };

        document.addEventListener('wheel', handleScroll, true);
        document.addEventListener('touchmove', handleScroll, true);

        return () => {
            document.removeEventListener('wheel', handleScroll, true);
            document.removeEventListener('touchmove', handleScroll, true);
        };
    }, [isOpen, isStandaloneMode, onClose]);

    const handleEmojiClick = (emoji) => {
        // Add to recent emojis
        const updated = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 24);
        setRecentEmojis(updated);
        localStorage.setItem('recentEmojis', JSON.stringify(updated));
        
        // Call appropriate callback
        if (isStandaloneMode) {
            onEmojiSelect?.(emoji);
            setIsOpen(false);
        } else {
            onSelect?.(emoji);
        }
    };

    const getFilteredEmojis = () => {
        if (!searchQuery.trim()) {
            return EMOJI_CATEGORIES[activeCategory];
        }
        
        // Search across all categories
        const allEmojis = Object.values(EMOJI_CATEGORIES).flat();
        return allEmojis.filter(emoji => {
            // Simple search - could be enhanced with emoji descriptions
            return emoji.includes(searchQuery);
        });
    // Standalone mode: render button + conditionally shown picker
    if (isStandaloneMode) {
        return (
            <div className="emoji-picker-wrapper">
                <button 
                    className={buttonClassName || 'emoji-trigger-btn'} 
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Smile size={20} />
                </button>
                {isOpen && (
                    <div className="emoji-picker-dropdown" ref={pickerRef}>
                        {/* Search bar */}
                        <div className="emoji-search">
                            <Search size={16} className="emoji-search-icon" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="emoji-search-input"
                                placeholder="Rechercher un emoji..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Categories */}
                        {!searchQuery && (
                            <div className="emoji-categories">
                                {recentEmojis.length > 0 && (
                                    <button
                                        className={`emoji-category-btn ${activeCategory === 'Recent' ? 'active' : ''}`}
                                        onClick={() => setActiveCategory('Recent')}
                                        title="Récents"
                                    >
                                        <Clock size={16} />
                                    </button>
                                )}
                                {Object.keys(EMOJI_CATEGORIES).map(category => (
                                    <button
                                        key={category}
                                        className={`emoji-category-btn ${activeCategory === category ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Emoji Grid */}
                        <div className="emoji-grid">
                            {displayedEmojis.length > 0 ? (
                                displayedEmojis.map((emoji, index) => (
                                    <button
                                        key={`${emoji}-${index}`}
                                        className="emoji-item"
                                        onClick={() => handleEmojiClick(emoji)}
                                        title={emoji}
                                    >
                                        {emoji}
                                    </button>
                                ))
                            ) : (
                                <div className="emoji-no-results">
                                    <p>Aucun emoji trouvé</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Controlled mode: just render the picker dropdown
    };

    const displayedEmojis = searchQuery.trim() ? getFilteredEmojis() : 
                           activeCategory === 'Recent' ? recentEmojis :
                           EMOJI_CATEGORIES[activeCategory];

    return (
        <div className="emoji-picker-dropdown" ref={pickerRef}>
            {/* Search bar */}
            <div className="emoji-search">
                <Search size={16} className="emoji-search-icon" />
                <input
                    ref={searchInputRef}
                    type="text"
                    className="emoji-search-input"
                    placeholder="Rechercher un emoji..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Categories */}
            {!searchQuery && (
                <div className="emoji-categories">
                    {recentEmojis.length > 0 && (
                        <button
                            className={`emoji-category-btn ${activeCategory === 'Recent' ? 'active' : ''}`}
                            onClick={() => setActiveCategory('Recent')}
                            title="Récents"
                        >
                            <Clock size={16} />
                        </button>
                    )}
                    {Object.keys(EMOJI_CATEGORIES).map(category => (
                        <button
                            key={category}
                            className={`emoji-category-btn ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            {/* Emoji Grid */}
            <div className="emoji-grid">
                {displayedEmojis.length > 0 ? (
                    displayedEmojis.map((emoji, index) => (
                        <button
                            key={`${emoji}-${index}`}
                            className="emoji-item"
                            onClick={() => handleEmojiClick(emoji)}
                            title={emoji}
                        >
                            {emoji}
                        </button>
                    ))
                ) : (
                    <div className="emoji-no-results">
                        <p>Aucun emoji trouvé</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmojiPicker;
