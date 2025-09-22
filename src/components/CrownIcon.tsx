import crown from '@/assets/crown.png'

export function CrownIcon() {
    return (
        <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${crown})` }}
        />
    )
}
