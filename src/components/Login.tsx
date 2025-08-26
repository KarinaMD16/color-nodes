import { FC } from 'react';
import { usePostCreateUser } from '../hooks/userHooks';

const Login: FC = () => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const radioButtons = Array.from(document.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
        const currentIndex = radioButtons.findIndex(radio => radio === document.activeElement);
        
        if (e.key === 'ArrowDown' && currentIndex < radioButtons.length - 1) {
            e.preventDefault();
            radioButtons[currentIndex + 1].focus();
            radioButtons[currentIndex + 1].click();
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
            e.preventDefault();
            radioButtons[currentIndex - 1].focus();
            radioButtons[currentIndex - 1].click();
        }
    };

    const { mutate: postCreateUser } = usePostCreateUser();

    return (
        <div className="w-full max-w-2xl mx-auto p-6 text-center font-press-start">
            <h1 className="font-press-start text-3xl md:text-4xl mb-8 whitespace-nowrap">
                <span style={{ color: '#7F5CC1' }}>Color</span>{' '}
                <span style={{ color: '#C15CAE' }}>Nodes</span>
                <span style={{ color: '#B0C15C' }}>!</span>
            </h1>
                
                <div className="nes-field mt-8 mb-10">
                    <label htmlFor="name_field" className="text-white text-left">Username</label>
                    <input 
                        type="text" 
                        id="name_field" 
                        className="nes-input is-dark w-full" 
                        placeholder="Enter your username"
                    />
                </div>

                <div 
                    className="mt-8 flex flex-col items-center space-y-6"
                    onKeyDown={handleKeyDown}
                    tabIndex={-1}
                >
                    <label className="flex items-center space-x-4 cursor-pointer">
                        <input 
                            type="radio" 
                            className="nes-radio" 
                            name="room-action"
                            tabIndex={0}
                            onClick={() => {
                                const username = (document.getElementById('name_field') as HTMLInputElement).value;
                                if (username) {
                                    postCreateUser({ username });
                                }
                            }}
                        />
                        <span className="font-press-start text-white text-sm">Create room</span>
                    </label>
                    
                    <label className="flex items-center space-x-4 cursor-pointer">
                        <input 
                            type="radio" 
                            className="nes-radio" 
                            name="room-action"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    window.location.href = '/join';
                                }
                            }}
                            onChange={() => window.location.href = '/join'}
                        />
                        <span className="font-press-start text-white text-sm">Join room</span>
                    </label>
                </div>
            </div>
    )
}

export default Login