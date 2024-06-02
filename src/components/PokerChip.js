import React, { useEffect } from 'react';
import './PokerChip.css'; // Optional: add CSS styles for the poker chip

function PokerChip({ id }) {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', id); // Set data to be transferred during drag

        // Adjust the drag image offset
        const rect = e.target.getBoundingClientRect();
        e.dataTransfer.setDragImage(e.target, rect.width / 2, rect.height / 2);
    };



    useEffect(() => {
        const handleDragOver = (e) => {
            e.preventDefault(); // Prevent default behavior to allow drop
        };

        let zIndex = 0;
        const handleDrop = (e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('text/plain');
            const pokerChip = document.getElementById(data);

            let x = 15;
            let pokerchips = Array.from({ length: x }, (_, i) => `pokerchip${i + 1}`);

            if (pokerchips.includes(data)) {
                // Handle drop of poker chip
                pokerChip.style.position = 'absolute';
                pokerChip.style.left = `${e.pageX - pokerChip.offsetWidth / 2}px`;
                pokerChip.style.top = `${e.pageY - pokerChip.offsetHeight / 2}px`;
                zIndex += 1;
                pokerChip.style.zIndex = zIndex;
                const buttonClick = new Audio('/sounds/click.wav');
                //playSound(buttonClick);
            }
        };

        // Add event listeners to the body
        document.body.addEventListener('dragover', handleDragOver);
        document.body.addEventListener('drop', handleDrop);

        // Clean up function
        return () => {
            document.body.removeEventListener('dragover', handleDragOver);
            document.body.removeEventListener('drop', handleDrop);
        };
    }, []);

    // function resetChips() {
    //     let pokerchips = Array.from({ length: 15 }, (_, i) => `pokerchip${i + 1}`);
    //     pokerchips.forEach(chip => {
    //         let pokerChip = document.getElementById(chip);
    //         pokerChip.style.position = 'absolute';
    //         pokerChip.style.left = "0px";
    //         pokerChip.style.bottom = "0px";
    //     });
    // }

    return (
        <img
            id={id}
            src="/pokerchip.png"
            alt="Poker Chip"
            className="poker-chip"
            draggable="true"
            onDragStart={handleDragStart}
        />
    );
}

export default PokerChip;
