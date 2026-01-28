import AdminLayout from "@/components/admin/AdminLayout";
import MediaLibrary from "@/components/admin/MediaLibrary";

const Media = () => {
  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            ספריית מדיה
          </h1>
          <p className="text-muted-foreground mt-1">
            ניהול תמונות וקבצי מדיה
          </p>
        </div>

        {/* Media Library Grid */}
        <MediaLibrary />
      </div>
    </AdminLayout>
  );
};

export default Media;
