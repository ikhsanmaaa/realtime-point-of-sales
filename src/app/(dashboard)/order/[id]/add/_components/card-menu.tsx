import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { convertIDR } from "@/lib/utils";
import { Menu } from "@/validations/menu-validations";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";

export default function CardMenu({ menu }: { menu: Menu }) {
  return (
    <Card
      key={menu.id}
      className="w-full h-full flex flex-col overflow-hidden rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="w-full aspect-4/3 overflow-hidden">
        <Image
          src={menu.image_url as string}
          alt={menu.name}
          width={400}
          height={400}
          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
        />
      </div>

      <CardContent className="flex-1 p-4 space-y-2">
        <h3 className="text-lg font-semibold line-clamp-1">{menu.name}</h3>

        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {menu.description}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span className="text-lg font-bold">{convertIDR(menu.price)}</span>

        <Button size="icon" className="rounded-xl">
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
