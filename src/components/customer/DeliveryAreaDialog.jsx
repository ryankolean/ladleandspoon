import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function DeliveryAreaDialog({ open, onClose }) {
  const imageUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9e6ea0a82df47a4e72e7f/d7dcafa6f_image.png";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Our Delivery Zone</DialogTitle>
          <DialogDescription>
            We deliver to the area highlighted below. Please ensure your address is within this zone before ordering.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <img src={imageUrl} alt="Delivery Area Map" className="rounded-lg w-full h-auto" />
        </div>
      </DialogContent>
    </Dialog>
  );
}