#include <gtk/gtk.h>
#include <epoxy/gl.h>
#include <stdio.h>

typedef struct {
  GMainLoop *loop;
  guint capture_timeout_ms;
} GfsGtkApp;

typedef struct {
  GfsGtkApp *app;
  GtkWidget *window;
  GtkWidget *gl_area;
  guint timeout_id;
  gboolean rendered;
} GfsGtkSurface;

static void window_destroyed(GtkWidget *widget, gpointer data) {
  (void)widget;
  GfsGtkSurface *surface = data;
  surface->window = NULL;
  surface->timeout_id = 0;
  g_main_loop_quit(surface->app->loop);
}

static gboolean close_timeout(gpointer data) {
  GfsGtkSurface *surface = data;
  surface->timeout_id = 0;
  if (surface->window != NULL)
    gtk_window_close(GTK_WINDOW(surface->window));
  return G_SOURCE_REMOVE;
}

static void gl_realize(GtkGLArea *area, gpointer data) {
  (void)data;
  gtk_gl_area_make_current(area);
  GError *error = gtk_gl_area_get_error(area);
  if (error != NULL) {
    fprintf(stderr, "[gl] context error: %s\n", error->message);
    return;
  }
  fprintf(stderr, "[gl] vendor=%s\n", glGetString(GL_VENDOR));
  fprintf(stderr, "[gl] renderer=%s\n", glGetString(GL_RENDERER));
  fprintf(stderr, "[gl] version=%s\n", glGetString(GL_VERSION));
  fprintf(stderr, "[gl] shading_language=%s\n", glGetString(GL_SHADING_LANGUAGE_VERSION));
}

static gboolean gl_render(GtkGLArea *area, GdkGLContext *context, gpointer data) {
  (void)context;
  GfsGtkSurface *surface = data;
  gtk_gl_area_make_current(area);
  if (gtk_gl_area_get_error(area) != NULL) return FALSE;

  GtkWidget *widget = GTK_WIDGET(area);
  int width = gtk_widget_get_width(widget);
  int height = gtk_widget_get_height(widget);
  glViewport(0, 0, width, height);

  glClearColor(0.05f, 0.07f, 0.12f, 1.0f);
  glClear(GL_COLOR_BUFFER_BIT);

  glEnable(GL_SCISSOR_TEST);
  glScissor(width / 4, height / 4, width / 2, height / 2);
  glClearColor(0.20f, 0.80f, 0.40f, 1.0f);
  glClear(GL_COLOR_BUFFER_BIT);
  glDisable(GL_SCISSOR_TEST);

  if (!surface->rendered) {
    fprintf(stderr, "[gl] rectangle x=%d y=%d width=%d height=%d\n",
            width / 4, height / 4, width / 2, height / 2);
    surface->rendered = TRUE;
  }
  return TRUE;
}

GfsGtkApp *gfs_gtk_app_new(guint capture_timeout_ms) {
  if (!gtk_init_check()) return NULL;
  GfsGtkApp *app = g_new0(GfsGtkApp, 1);
  app->loop = g_main_loop_new(NULL, FALSE);
  app->capture_timeout_ms = capture_timeout_ms;
  return app;
}

void gfs_gtk_app_run(GfsGtkApp *app) {
  g_main_loop_run(app->loop);
}

void gfs_gtk_app_free(GfsGtkApp *app) {
  g_main_loop_unref(app->loop);
  g_free(app);
}

GfsGtkSurface *gfs_gtk_surface_new(GfsGtkApp *app, int width, int height) {
  GfsGtkSurface *surface = g_new0(GfsGtkSurface, 1);
  surface->app = app;
  surface->window = gtk_window_new();
  surface->gl_area = gtk_gl_area_new();
  gtk_gl_area_set_required_version(GTK_GL_AREA(surface->gl_area), 4, 3);
  gtk_gl_area_set_has_depth_buffer(GTK_GL_AREA(surface->gl_area), FALSE);
  gtk_gl_area_set_has_stencil_buffer(GTK_GL_AREA(surface->gl_area), FALSE);
  gtk_window_set_title(GTK_WINDOW(surface->window), "Ghostty from Scratch");
  gtk_window_set_default_size(GTK_WINDOW(surface->window), width, height);
  gtk_window_set_child(GTK_WINDOW(surface->window), surface->gl_area);
  g_signal_connect(surface->window, "destroy", G_CALLBACK(window_destroyed), surface);
  g_signal_connect(surface->gl_area, "realize", G_CALLBACK(gl_realize), surface);
  g_signal_connect(surface->gl_area, "render", G_CALLBACK(gl_render), surface);
  gtk_window_present(GTK_WINDOW(surface->window));
  if (app->capture_timeout_ms > 0)
    surface->timeout_id = g_timeout_add(app->capture_timeout_ms, close_timeout, surface);
  return surface;
}

void gfs_gtk_surface_free(GfsGtkSurface *surface) {
  if (surface->timeout_id != 0) g_source_remove(surface->timeout_id);
  if (surface->window != NULL) gtk_window_destroy(GTK_WINDOW(surface->window));
  g_free(surface);
}
