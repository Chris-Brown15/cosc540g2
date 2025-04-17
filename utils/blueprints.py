def register_blueprints(app, prefix, blueprints):
    for bp, sub_prefix in blueprints: 
        app.register_blueprint(bp, url_prefix=f"/{prefix}/{sub_prefix}") 
        