import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "./ui/dialog";
import focoImage from '../../foquito.png';

const GameInfo = () => {
    return (
        <Dialog>
            <DialogTrigger className="focus:outline-none focus:ring-0">
                <img 
                    className="w-28 h-26"
                    src={focoImage} 
                    alt="Game Info"
                />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="pb-4">How to play</DialogTitle>
                    <DialogDescription className="pb-4">
                        <span style={{ color: '#7F5CC1' }} className="font-bold">1.</span> Create a room and invite your friends to join.
                    </DialogDescription>
                    <DialogDescription className="pb-4">
                        <span style={{ color: '#C15CAE' }} className="font-bold">2.</span> When the host starts the game, the first player decides the initial color order for the cups.
                    </DialogDescription>
                    <DialogDescription className="pb-4">
                        <span style={{ color: '#B0C15C' }} className="font-bold">3.</span> The goal is to make all cups match the hidden color order.
                    </DialogDescription>
                    <DialogDescription className="pb-4">
                        <span style={{ color: '#7F5CC1' }} className="font-bold">4.</span> In your turn, you can interchange only two cups from their positions. You have 30 seconds to make a move.
                    </DialogDescription>
                    <DialogDescription className="pb-4">
                        <span style={{ color: '#C15CAE' }} className="font-bold">5.</span> The game ends when one player makes the move that makes all cups match the hidden color order.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <button className="nes-btn is-pointer is-success">Got it!</button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default GameInfo